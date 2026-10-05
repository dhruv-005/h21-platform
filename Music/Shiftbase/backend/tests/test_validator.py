"""
Shiftbase - Schema & Record Validator Tests
Validates structural schema rules, type constraints, nullability, and enum sets.
"""

from models.schema import FieldDefinition, SchemaDefinition
from services.validator import RecordValidator


def test_validate_schema_definition_valid():
    validator = RecordValidator()
    schema_dict = {
        "name": "users_v2",
        "fields": [
            {"name": "id", "type": "integer", "nullable": False},
            {"name": "email", "type": "string", "nullable": False},
        ],
    }
    result = validator.validate_schema(schema_dict)
    assert result["valid"] is True
    assert result["field_count"] == 2
    assert len(result["errors"]) == 0


def test_validate_schema_definition_duplicate_fields():
    validator = RecordValidator()
    schema_dict = {
        "name": "invalid_schema",
        "fields": [
            {"name": "id", "type": "integer"},
            {"name": "id", "type": "string"},
        ],
    }
    result = validator.validate_schema(schema_dict)
    assert result["valid"] is False
    assert any("Duplicate field name" in e for e in result["errors"])


def test_validate_record_constraints():
    validator = RecordValidator()
    target_schema = SchemaDefinition(
        name="target_test",
        fields=[
            FieldDefinition(name="id", type="integer", nullable=False),
            FieldDefinition(name="email", type="string", nullable=False, max_length=20),
            FieldDefinition(name="status", type="string", nullable=False, allowed_values=["active", "inactive"]),
            FieldDefinition(name="optional_notes", type="string", nullable=True),
        ],
    )

    # Valid record
    valid_rec = {"id": 1, "email": "a@b.com", "status": "active", "optional_notes": None}
    errors = validator.validate_record(valid_rec, target_schema)
    assert len(errors) == 0

    # Missing required field
    missing_id_rec = {"id": None, "email": "a@b.com", "status": "active"}
    errors = validator.validate_record(missing_id_rec, target_schema)
    assert any("is required" in e.error for e in errors)

    # String exceeds max_length
    long_email_rec = {"id": 2, "email": "this_is_way_too_long_for_twenty_characters@test.com", "status": "active"}
    errors = validator.validate_record(long_email_rec, target_schema)
    assert any("exceeds max_length" in e.error for e in errors)

    # Invalid enum value
    bad_enum_rec = {"id": 3, "email": "a@b.com", "status": "banned"}
    errors = validator.validate_record(bad_enum_rec, target_schema)
    assert any("not in allowed set" in e.error for e in errors)