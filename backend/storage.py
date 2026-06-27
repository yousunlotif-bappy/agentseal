"""
AgentSeal In-Memory Storage
---------------------------

This is a simple MVP storage layer.

Important:
- Data stays in memory while the FastAPI server is running.
- If the server restarts, data resets.
- Later this can be replaced with PostgreSQL, SQLite, Supabase, Firebase,
  or UiPath Data Service.
"""

from typing import Any, Dict


STORE: Dict[str, Dict[str, Any]] = {
    "assessments": {},
    "policies": {},
    "tests": {},
    "red_team": {},
    "executions": {},
    "risk": {},
    "reviews": {},
    "reports": {},
    "certificates": {},
    "monitoring": {},
}


def put(bucket: str, key: str, value: Any) -> Any:
    """
    Save a value inside a named bucket.
    """

    STORE.setdefault(bucket, {})
    STORE[bucket][key] = value
    return value


def get(bucket: str, key: str, default: Any = None) -> Any:
    """
    Read a value from a named bucket.
    """

    return STORE.get(bucket, {}).get(key, default)


