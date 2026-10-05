"""
Shiftbase - Schema Mapping Prompts
Defines structured prompts and parsing utilities for LLM schema alignment.
"""

import json
import re
from typing import Any, Dict, List, Optional


MAPPING_SYSTEM_PROMPT = """
You are the Shiftbase Intelligent Data Architect, an expert AI system designed to analyze relational database schemas, inspect real-world sample data records, and propose precise, deterministic migration mappings.

### YOUR RESPONSIBILITIES:
1. FIELD MAPPINGS: For every target field, determine the best source field(s) and transformation rule to populate it.
2. DISCREPANCY DETECTION: Identify source fields without targets (data loss risk) and target fields without sources (unfulfilled dependencies).
3. TRANSFORMATION SELECTION: Select transformation rules ONLY from the authorized list below. NEVER invent new rules or generate custom code.
4. PARAMETER SPECIFICATION: Provide exact parameters (delimiters, format strings, slice indices, default values) needed for deterministic execution.
5. RISK ASSESSMENT: Flag risks such as potential truncation, date parsing ambiguities, nullability conflicts, or multi-part string split failures.

### AUTHORIZED TRANSFORMATION RULES & PARAMETERS:
- direct_copy: Copy field directly. params: {}
- split_string: Split string by delimiter and extract index. params: {"delimiter": " ", "index": 0}
- concat_fields: Combine multiple source fields. params: {"delimiter": " "} (requires "source_fields": ["field_a", "field_b"])
- format_date: Convert date string between strftime formats. params: {"from_format": "%m/%d/%Y", "to_format": "%Y-%m-%dT%H:%M:%SZ"}
- uppercase: Convert text to uppercase. params: {}
- lowercase: Convert text to lowercase. params: {}
- trim: Strip leading/trailing whitespace. params: {}
- to_integer: Parse string/float to integer. params: {}
- to_float: Parse string to float. params: {}
- to_string: Convert value to string. params: {}
- default_value: Supply fallback if null. params: {"default": "value"}
- truncate: Clip string at maximum length. params: {"max_length": 200}

### OUTPUT FORMAT REQUIREMENTS:
You MUST respond with a SINGLE valid JSON object. Do not include introductory text, markdown explanations outside the JSON, or closing commentary.

Required JSON Structure:
{
  "mappings": [
    {
      "target_field": "<target_column_name>",
      "source_field": "<source_column_name_or_null>",
      "source_fields": ["<source_1>", "<source_2>"],
      "transformation": "<authorized_rule_name>",
      "transformation_params": { ... },
      "confidence": <float_between_0.0_and_1.0>,
      "risk_notes": "<concise explanation of any risk or null/overflow scenario>"
    }
  ],
  "unmapped_source_fields": ["<source_fields_dropped>"],
  "unmapped_target_fields": ["<target_fields_without_source>"],
  "warnings": [
    "<High-level warning about data loss, type casts, or missing mandatory fields>"
  ],
  "overall_risk": "<low | medium | high>"
}
"""


def build_mapping_user_prompt(
    source_schema: Dict[str, Any],
    target_schema: Dict[str, Any],
    sample_records: Optional[List[Dict[str, Any]]] = None,
    supported_rules: Optional[List[str]] = None,
) -> str:
    """Constructs the prompt payload providing schemas and sample records."""
    
    # Cap sample records to 10 items to preserve context window
    samples = (sample_records or [])[:10]
    
    prompt_payload = {
        "source_schema": source_schema,
        "target_schema": target_schema,
        "sample_source_records": samples,
        "allowed_transformations": supported_rules or [
            "split_string",
            "concat_fields",
            "format_date",
            "uppercase",
            "lowercase",
            "trim",
            "to_integer",
            "to_float",
            "to_string",
            "default_value",
            "truncate",
            "direct_copy",
        ],
    }

    return f"""
Please analyze the following migration context and generate the complete mapping proposal JSON:

{json.dumps(prompt_payload, indent=2)}
"""


def extract_json_from_llm_response(raw_text: str) -> Dict[str, Any]:
    """
    Robustly extracts and parses JSON from raw LLM output, 
    stripping markdown fences or surrounding chatter if present.
    """
    cleaned = raw_text.strip()

    # 1. Remove standard markdown code blocks (```json ... ``` or ``` ... ```)
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
        cleaned = cleaned.strip()

    # 2. Attempt direct parse
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # 3. Fallback regex to find outermost JSON object braces
    match = re.search(r"(\{.*\})", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError as e:
            raise ValueError(f"Extracted JSON block was invalid: {e}")

    raise ValueError("Failed to locate a valid JSON object in LLM response.")