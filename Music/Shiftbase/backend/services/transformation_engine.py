"""
Shiftbase - Deterministic Transformation Engine
Pure Python functions executing bounded, safe transformations. No AI or dynamic code execution.
"""

import re
from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Optional, Tuple
from models.execution import RecordError
from models.plan import FieldMapping


def _parse_flexible_datetime(value_str: str) -> datetime:
    """Attempts to parse common date formats if specific strptime fails."""
    clean_val = value_str.strip()
    formats_to_try = [
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S%z",
        "%m/%d/%Y",
        "%m/%d/%Y %H:%M:%S",
        "%d/%m/%Y",
        "%Y-%m-%d",
        "%Y/%m/%d",
    ]
    for fmt in formats_to_try:
        try:
            return datetime.strptime(clean_val, fmt)
        except ValueError:
            continue
    raise ValueError(f"Unable to parse '{clean_val}' into a recognized datetime")


# ── Transform Implementations ──

def transform_direct_copy(value: Any, params: Dict[str, Any]) -> Any:
    return value


def transform_split_string(value: Any, params: Dict[str, Any]) -> Any:
    if value is None:
        return None
    val_str = str(value)
    delimiter = params.get("delimiter", " ")
    index = int(params.get("index", 0))

    parts = [p.strip() for p in val_str.split(delimiter) if p.strip()] if delimiter == " " else val_str.split(delimiter)
    
    if index < 0 or index >= len(parts):
        raise IndexError(f"Split index {index} out of bounds for value '{val_str}' (yielded {len(parts)} parts)")
    return parts[index]


def transform_concat_fields(record: Dict[str, Any], params: Dict[str, Any], source_fields: Optional[List[str]] = None) -> str:
    fields = source_fields or params.get("fields", [])
    delimiter = params.get("delimiter", " ")
    parts = []
    for f in fields:
        val = record.get(f)
        if val is not None:
            parts.append(str(val))
    return delimiter.join(parts)


def transform_format_date(value: Any, params: Dict[str, Any]) -> Any:
    if value is None:
        return None
    val_str = str(value).strip()
    from_format = params.get("from_format")
    to_format = params.get("to_format", "%Y-%m-%dT%H:%M:%SZ")

    if from_format:
        try:
            dt = datetime.strptime(val_str, from_format)
        except ValueError:
            dt = _parse_flexible_datetime(val_str)
    else:
        dt = _parse_flexible_datetime(val_str)

    if to_format == "ISO8601" or to_format == "%Y-%m-%dT%H:%M:%SZ":
        return dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    return dt.strftime(to_format)


def transform_uppercase(value: Any, params: Dict[str, Any]) -> Any:
    return str(value).upper() if value is not None else None


def transform_lowercase(value: Any, params: Dict[str, Any]) -> Any:
    return str(value).lower() if value is not None else None


def transform_trim(value: Any, params: Dict[str, Any]) -> Any:
    return str(value).strip() if value is not None else None


def transform_to_integer(value: Any, params: Dict[str, Any]) -> Optional[int]:
    if value is None:
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    val_str = str(value).strip()
    if not val_str:
        return None
    # Strip any decimal point if integer cast requested
    if "." in val_str:
        return int(float(val_str))
    return int(val_str)


def transform_to_float(value: Any, params: Dict[str, Any]) -> Optional[float]:
    if value is None:
        return None
    if isinstance(value, float):
        return value
    val_str = str(value).strip()
    if not val_str:
        return None
    return float(val_str)


def transform_to_string(value: Any, params: Dict[str, Any]) -> Optional[str]:
    return str(value) if value is not None else None


def transform_default_value(value: Any, params: Dict[str, Any]) -> Any:
    if value is None:
        return params.get("default")
    if isinstance(value, str) and not value.strip():
        return params.get("default")
    return value


def transform_truncate(value: Any, params: Dict[str, Any]) -> Optional[str]:
    if value is None:
        return None
    val_str = str(value)
    max_len = int(params.get("max_length", 255))
    return val_str[:max_len]


# Transformation Dispatch Registry
TRANSFORMATIONS: Dict[str, Callable] = {
    "direct_copy": transform_direct_copy,
    "split_string": transform_split_string,
    "format_date": transform_format_date,
    "uppercase": transform_uppercase,
    "lowercase": transform_lowercase,
    "trim": transform_trim,
    "to_integer": transform_to_integer,
    "to_float": transform_to_float,
    "to_string": transform_to_string,
    "default_value": transform_default_value,
    "truncate": transform_truncate,
}


class TransformationEngine:
    """Executes field-by-field transformations over records."""

    def apply_mapping(
        self,
        source_record: Dict[str, Any],
        mappings: List[FieldMapping],
    ) -> Tuple[Dict[str, Any], List[RecordError]]:
        """
        Transforms a single source record into the target structure.
        Returns (transformed_target_dict, list_of_transformation_errors).
        """
        target_record: Dict[str, Any] = {}
        errors: List[RecordError] = []

        for mapping in mappings:
            target_field = mapping.target_field
            rule = mapping.transformation
            params = mapping.transformation_params or {}

            # Handle multi-field concatenation
            if rule == "concat_fields":
                try:
                    res = transform_concat_fields(source_record, params, mapping.source_fields)
                    target_record[target_field] = res
                except Exception as e:
                    errors.append(
                        RecordError(
                            field=target_field,
                            source_field=",".join(mapping.source_fields or []),
                            error=f"Concat error: {str(e)}",
                            source_value=None,
                        )
                    )
                continue

            # Standard single-field transformation
            src_field = mapping.source_field
            src_val = source_record.get(src_field) if src_field else None

            if rule not in TRANSFORMATIONS:
                errors.append(
                    RecordError(
                        field=target_field,
                        source_field=src_field,
                        error=f"Unsupported transformation rule '{rule}'",
                        source_value=src_val,
                    )
                )
                continue

            transform_fn = TRANSFORMATIONS[rule]
            try:
                out_val = transform_fn(src_val, params)
                target_record[target_field] = out_val
            except Exception as e:
                errors.append(
                    RecordError(
                        field=target_field,
                        source_field=src_field,
                        error=f"Transformation '{rule}' failed: {str(e)}",
                        source_value=src_val,
                    )
                )

        return target_record, errors