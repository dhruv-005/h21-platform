"""
Shiftbase - Prompts Package
Prompt templates and formatting utilities for AI Schema Mapping Agent.
"""

from prompts.mapping_prompt import (
    MAPPING_SYSTEM_PROMPT,
    build_mapping_user_prompt,
    extract_json_from_llm_response,
)

__all__ = [
    "MAPPING_SYSTEM_PROMPT",
    "build_mapping_user_prompt",
    "extract_json_from_llm_response",
]