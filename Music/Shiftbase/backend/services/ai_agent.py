"""
Shiftbase - AI Agent & LLM Providers
Enhanced heuristic with max_length detection and truncate auto-application.
"""

import logging
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

import httpx
from config import settings
from models.plan import FieldMapping, PlanProposalResponse
from models.schema import SchemaDefinition
from prompts.mapping_prompt import (
    MAPPING_SYSTEM_PROMPT,
    build_mapping_user_prompt,
    extract_json_from_llm_response,
)

logger = logging.getLogger("shiftbase.ai_agent")


class LLMProvider(ABC):
    @abstractmethod
    async def generate_response(self, system_prompt: str, user_prompt: str) -> str:
        pass


class GeminiProvider(LLMProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def generate_response(self, system_prompt: str, user_prompt: str) -> str:
        if not self.api_key:
            raise ValueError("Gemini API key is not configured")
        import google.generativeai as genai
        genai.configure(api_key=self.api_key)
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=system_prompt,
        )
        res = await model.generate_content_async(user_prompt)
        return res.text


class OllamaProvider(LLMProvider):
    def __init__(self, base_url: str = "http://localhost:11434", model: str = "llama3"):
        self.base_url = base_url.rstrip("/")
        self.model = model

    async def generate_response(self, system_prompt: str, user_prompt: str) -> str:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{self.base_url}/api/chat",
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "stream": False,
                },
            )
            resp.raise_for_status()
            return resp.json()["message"]["content"]


class FallbackRuleAgent:
    """
    Enhanced heuristic mapping engine with:
    1. Exact name matching
    2. Hardcoded alias matching
    3. Substring/prefix/suffix fuzzy matching
    4. Type-compatible fallback pairing
    5. Auto-detect max_length and apply truncate
    """

    ALIASES = {
        "id": ("user_id", "direct_copy", {}),
        "first_name": ("full_name", "split_string", {"delimiter": " ", "index": 0}),
        "last_name": ("full_name", "split_string", {"delimiter": " ", "index": 1}),
        "created_at": ("signup_date", "format_date", {"to_format": "%Y-%m-%dT%H:%M:%SZ"}),
        "email_address": ("email", "direct_copy", {}),
        "status": ("account_status", "direct_copy", {}),
        "total_logins": ("login_count", "to_integer", {}),
        "profile_summary": ("bio", "truncate", {"max_length": 200}),
        "joined_at": ("hire_date", "format_date", {"to_format": "%Y-%m-%dT%H:%M:%SZ"}),
        "annual_salary": ("salary", "to_integer", {}),
        "team": ("department", "direct_copy", {}),
        "summary": ("bio", "truncate", {"max_length": 50}),
        "bio_summary": ("biography", "truncate", {"max_length": 80}),
    }

    def _normalize(self, name: str) -> str:
        return name.lower().replace("_", "").replace("-", "")

    def _is_substring_match(self, source_name: str, target_name: str) -> bool:
        s = self._normalize(source_name)
        t = self._normalize(target_name)
        return s in t or t in s

    def _get_type_cast_rule(self, source_type: str, target_type: str) -> Optional[tuple]:
        if source_type == target_type:
            return ("direct_copy", {})
        if target_type == "integer" and source_type == "string":
            return ("to_integer", {})
        if target_type == "float" and source_type == "string":
            return ("to_float", {})
        if target_type == "string":
            return ("to_string", {})
        if target_type == "integer" and source_type == "float":
            return ("to_integer", {})
        return None

    def _apply_max_length_check(
        self, rule: str, params: Dict, target_field: Dict
    ) -> tuple:
        max_len = target_field.get("max_length")
        if max_len and rule in ("direct_copy", "to_string"):
            return ("truncate", {"max_length": max_len})
        return (rule, params)

    def propose_heuristic_mappings(
        self, source_schema: Dict[str, Any], target_schema: Dict[str, Any]
    ) -> Dict[str, Any]:
        source_fields = {f["name"]: f for f in source_schema.get("fields", [])}
        target_fields = target_schema.get("fields", [])

        mappings: List[Dict[str, Any]] = []
        mapped_sources = set()
        unmapped_targets: List[str] = []
        warnings: List[str] = []

        for tf in target_fields:
            tname = tf["name"]
            ttype = tf.get("type", "string")

            # PASS 1: Exact name match
            if tname in source_fields:
                sf = source_fields[tname]
                mapped_sources.add(tname)
                type_rule = self._get_type_cast_rule(sf.get("type", "string"), ttype)
                rule, params = type_rule if type_rule else ("direct_copy", {})
                rule, params = self._apply_max_length_check(rule, params, tf)
                mappings.append({
                    "target_field": tname,
                    "source_field": tname,
                    "transformation": rule,
                    "transformation_params": params,
                    "confidence": 1.0,
                    "risk_notes": "Exact field name match",
                })
                continue

            # PASS 2: Hardcoded alias match
            if tname in self.ALIASES:
                alias_src, alias_rule, alias_params = self.ALIASES[tname]
                if alias_src in source_fields:
                    mapped_sources.add(alias_src)
                    rule, params = self._apply_max_length_check(alias_rule, alias_params, tf)
                    mappings.append({
                        "target_field": tname,
                        "source_field": alias_src,
                        "transformation": rule,
                        "transformation_params": params,
                        "confidence": 0.88,
                        "risk_notes": f"Matched via alias to '{alias_src}'",
                    })
                    continue

            # PASS 3: Substring / fuzzy match
            best_match = None
            best_score = 0
            for sname, sf in source_fields.items():
                if sname in mapped_sources:
                    continue
                if self._is_substring_match(sname, tname):
                    score = len(self._normalize(sname)) + len(self._normalize(tname))
                    if score > best_score:
                        best_score = score
                        best_match = sname

            if best_match:
                sf = source_fields[best_match]
                mapped_sources.add(best_match)
                type_rule = self._get_type_cast_rule(sf.get("type", "string"), ttype)
                rule, params = type_rule if type_rule else ("direct_copy", {})
                rule, params = self._apply_max_length_check(rule, params, tf)
                mappings.append({
                    "target_field": tname,
                    "source_field": best_match,
                    "transformation": rule,
                    "transformation_params": params,
                    "confidence": 0.75,
                    "risk_notes": f"Fuzzy matched to '{best_match}' (substring similarity)",
                })
                continue

            # PASS 4: Type-compatible fallback
            type_match = None
            for sname, sf in source_fields.items():
                if sname in mapped_sources:
                    continue
                stype = sf.get("type", "string")
                if self._get_type_cast_rule(stype, ttype) is not None:
                    type_match = sname
                    break

            if type_match:
                sf = source_fields[type_match]
                mapped_sources.add(type_match)
                type_rule = self._get_type_cast_rule(sf.get("type", "string"), ttype)
                rule, params = type_rule if type_rule else ("direct_copy", {})
                rule, params = self._apply_max_length_check(rule, params, tf)
                mappings.append({
                    "target_field": tname,
                    "source_field": type_match,
                    "transformation": rule,
                    "transformation_params": params,
                    "confidence": 0.55,
                    "risk_notes": f"Type-compatible fallback to '{type_match}' (verify manually)",
                })
                continue

            unmapped_targets.append(tname)
            warnings.append(f"Target field '{tname}' could not be matched automatically.")

        unmapped_sources = [name for name in source_fields if name not in mapped_sources]
        for us in unmapped_sources:
            warnings.append(f"Source field '{us}' will be dropped (no matching target).")

        overall_risk = "low"
        if unmapped_sources or unmapped_targets:
            overall_risk = "medium"
        if len(unmapped_targets) > len(target_fields) // 2:
            overall_risk = "high"

        return {
            "mappings": mappings,
            "unmapped_source_fields": unmapped_sources,
            "unmapped_target_fields": unmapped_targets,
            "warnings": warnings,
            "overall_risk": overall_risk,
        }


class AIAgent:
    def __init__(self, provider: Optional[LLMProvider] = None):
        self.provider = provider
        self.fallback = FallbackRuleAgent()

    async def propose_migration_plan(
        self,
        plan_id: str,
        version: int,
        source_schema: SchemaDefinition,
        target_schema: SchemaDefinition,
        sample_records: Optional[List[Dict[str, Any]]] = None,
        supported_rules: Optional[List[str]] = None,
    ) -> PlanProposalResponse:
        src_dict = source_schema.model_dump()
        tgt_dict = target_schema.model_dump()
        proposal_data = None

        if self.provider is not None:
            try:
                user_prompt = build_mapping_user_prompt(
                    src_dict, tgt_dict, sample_records, supported_rules
                )
                raw = await self.provider.generate_response(
                    MAPPING_SYSTEM_PROMPT, user_prompt
                )
                proposal_data = extract_json_from_llm_response(raw)
            except Exception as e:
                logger.warning(f"LLM failed ({e}), falling back to heuristic")

        if proposal_data is None:
            proposal_data = self.fallback.propose_heuristic_mappings(src_dict, tgt_dict)

        mappings = [FieldMapping(**m) for m in proposal_data.get("mappings", [])]
        return PlanProposalResponse(
            plan_id=plan_id,
            version=version,
            mappings=mappings,
            unmapped_source_fields=proposal_data.get("unmapped_source_fields", []),
            unmapped_target_fields=proposal_data.get("unmapped_target_fields", []),
            warnings=proposal_data.get("warnings", []),
            overall_risk=proposal_data.get("overall_risk", "medium"),
        )
