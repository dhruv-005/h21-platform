"""
Shiftbase - Record & Schema Validator
Validates transformed records against target schema blueprints.
"""

from typing import Any, Dict, List
from models.execution import RecordError
from models.schema import SchemaDefinition, FieldDefinition


class RecordValidator:
    """Validates transformed target records against target SchemaDefinition."""

    def validate_record(
        self,
        record: Dict[str, Any],
        target_schema: SchemaDefinition,
    ) -> List[RecordError]:
        """
        Validates a single record against nullability, data types, lengths, and enums.
        Returns a list of RecordError objects if violations occur.
        """
        errors: List[RecordError] = []

        for field_def in target_schema.fields:
            name = field_def.name
            value = record.get(name)

            # 1. Nullability & Default Checks
            if value is None or (isinstance(value, str) and not value.strip() and not field_def.nullable):
                if not field_def.nullable:
                    if field_def.default is not None:
                        record[name] = field_def.default
                        value = field_def.default
                    else:
                        errors.append(
                            RecordError(
                                field=name,
                                error=f"Field '{name}' is required (non-nullable) but value is null or empty",
                                source_value=value,
                            )
                        )
                        continue

            if value is None:
                continue

            # 2. Type Validations
            ftype = field_def.type
            if ftype == "integer" and not isinstance(value, int) and not (isinstance(value, str) and value.isdigit()):
                errors.append(
                    RecordError(
                        field=name,
                        error=f"Expected integer for '{name}', received {type(value).__name__} ('{value}')",
                        source_value=value,
                    )
                )

            elif ftype == "float" and not isinstance(value, (int, float)):
                try:
                    float(value)
                except (ValueError, TypeError):
                    errors.append(
                        RecordError(
                            field=name,
                            error=f"Expected float for '{name}', received '{value}'",
                            source_value=value,
                        )
                    )

            elif ftype == "boolean" and not isinstance(value, bool):
                if str(value).lower() not in ("true", "false", "1", "0"):
                    errors.append(
                        RecordError(
                            field=name,
                            error=f"Expected boolean for '{name}', received '{value}'",
                            source_value=value,
                        )
                    )

            # 3. String Constraints
            if isinstance(value, str):
                if field_def.max_length and len(value) > field_def.max_length:
                    errors.append(
                        RecordError(
                            field=name,
                            error=f"Value length ({len(value)}) exceeds max_length ({field_def.max_length})",
                            source_value=value,
                        )
                    )

            # 4. Enum / Allowed Values Constraint
            if field_def.allowed_values is not None:
                if value not in field_def.allowed_values:
                    errors.append(
                        RecordError(
                            field=name,
                            error=f"Value '{value}' not in allowed set {field_def.allowed_values}",
                            source_value=value,
                        )
                    )

        return errors

    def validate_schema(self, schema_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Validates the structure of a SchemaDefinition dictionary."""
        errors = []
        warnings = []

        if not schema_dict.get("name"):
            errors.append("Schema 'name' is required.")
        fields = schema_dict.get("fields", [])
        if not fields:
            errors.append("Schema must contain at least one field definition.")

        seen_names = set()
        for f in fields:
            fname = f.get("name")
            if not fname:
                errors.append("All fields must have a 'name'.")
            elif fname in seen_names:
                errors.append(f"Duplicate field name '{fname}' detected.")
            seen_names.add(fname)

            if not f.get("type"):
                errors.append(f"Field '{fname}' missing 'type'.")

        return {
            "valid": len(errors) == 0,
            "field_count": len(fields),
            "errors": errors,
            "warnings": warnings,
        }