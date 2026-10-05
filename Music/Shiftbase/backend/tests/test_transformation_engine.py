"""
Shiftbase - Transformation Engine Unit Tests
Tests all 12 deterministic transformation functions and edge-case behaviors.
"""

import pytest
from models.plan import FieldMapping
from services.transformation_engine import (
    TransformationEngine,
    transform_concat_fields,
    transform_default_value,
    transform_direct_copy,
    transform_format_date,
    transform_lowercase,
    transform_split_string,
    transform_to_float,
    transform_to_integer,
    transform_to_string,
    transform_trim,
    transform_truncate,
    transform_uppercase,
)


def test_transform_direct_copy():
    assert transform_direct_copy("alpha", {}) == "alpha"
    assert transform_direct_copy(42, {}) == 42
    assert transform_direct_copy(None, {}) is None


def test_transform_split_string():
    assert transform_split_string("Jane Doe", {"delimiter": " ", "index": 0}) == "Jane"
    assert transform_split_string("Jane Doe", {"delimiter": " ", "index": 1}) == "Doe"
    assert transform_split_string("A,B,C", {"delimiter": ",", "index": 2}) == "C"

    with pytest.raises(IndexError):
        transform_split_string("SingleName", {"delimiter": " ", "index": 1})


def test_transform_concat_fields():
    record = {"first": "John", "last": "Smith"}
    assert transform_concat_fields(record, {"delimiter": " "}, source_fields=["first", "last"]) == "John Smith"
    assert transform_concat_fields(record, {"delimiter": "-"}, source_fields=["first", "last"]) == "John-Smith"


def test_transform_format_date():
    assert transform_format_date("03/15/2023", {"from_format": "%m/%d/%Y", "to_format": "%Y-%m-%d"}) == "2023-03-15"
    assert transform_format_date("2024-11-20 09:32:15", {"to_format": "ISO8601"}) == "2024-11-20T09:32:15Z"


def test_transform_casing_and_trim():
    assert transform_uppercase("hello", {}) == "HELLO"
    assert transform_lowercase("WORLD", {}) == "world"
    assert transform_trim("  clean me  ", {}) == "clean me"


def test_transform_type_casting():
    assert transform_to_integer("142", {}) == 142
    assert transform_to_integer(142.9, {}) == 142
    assert transform_to_float("3.1415", {}) == 3.1415
    assert transform_to_string(999, {}) == "999"


def test_transform_default_and_truncate():
    assert transform_default_value(None, {"default": "active"}) == "active"
    assert transform_default_value("present", {"default": "active"}) == "present"
    assert transform_truncate("Super long text that should be cut", {"max_length": 10}) == "Super long"


def test_engine_apply_mapping():
    engine = TransformationEngine()
    source_record = {
        "user_id": 101,
        "full_name": "Ada Lovelace",
        "signup_date": "01/01/2024",
        "bio": "Pioneer of computing algorithms.",
    }
    mappings = [
        FieldMapping(target_field="id", source_field="user_id", transformation="direct_copy"),
        FieldMapping(target_field="first_name", source_field="full_name", transformation="split_string", transformation_params={"delimiter": " ", "index": 0}),
        FieldMapping(target_field="last_name", source_field="full_name", transformation="split_string", transformation_params={"delimiter": " ", "index": 1}),
        FieldMapping(target_field="created_at", source_field="signup_date", transformation="format_date", transformation_params={"to_format": "%Y-%m-%d"}),
        FieldMapping(target_field="summary", source_field="bio", transformation="truncate", transformation_params={"max_length": 7}),
    ]

    target, errors = engine.apply_mapping(source_record, mappings)

    assert len(errors) == 0
    assert target["id"] == 101
    assert target["first_name"] == "Ada"
    assert target["last_name"] == "Lovelace"
    assert target["created_at"] == "2024-01-01"
    assert target["summary"] == "Pioneer"