"""
AgentSeal environment checker.

This script verifies that required UiPath environment variables exist.
It never prints secrets directly.
"""

import os
from dotenv import load_dotenv


def mask_secret(value: str | None) -> str:
    """Hide secret values when printing to terminal."""
    if not value:
        return "MISSING"
    if len(value) <= 8:
        return "SET_BUT_HIDDEN"
    return f"{value[:4]}...{value[-4:]}"


def main() -> None:
    load_dotenv()

    required_keys = [
        "UIPATH_ORG_NAME",
        "UIPATH_TENANT_NAME",
        "UIPATH_CLIENT_ID",
        "UIPATH_CLIENT_SECRET",
        "UIPATH_ORCHESTRATOR_URL",
        "UIPATH_TEST_MANAGER_URL",
        "UIPATH_FOLDER_ID",
        "UIPATH_RELEASE_KEY",
        "UIPATH_TEST_SET_ID",
        "UIPATH_TEST_PROJECT_ID",
    ]

    print("AgentSeal UiPath environment check")
    print("-" * 45)

    missing = []

    for key in required_keys:
        value = os.getenv(key)

        if not value or value.startswith("your_") or value.startswith("replace_"):
            missing.append(key)

        if "SECRET" in key or "CLIENT_ID" in key:
            print(f"{key}: {mask_secret(value)}")
        else:
            print(f"{key}: {value or 'MISSING'}")

    print("-" * 45)

    if missing:
        print("Missing or placeholder values:")
        for key in missing:
            print(f"- {key}")
        raise SystemExit(1)

    print("All required UiPath environment values are present.")


if __name__ == "__main__":
    main()


    