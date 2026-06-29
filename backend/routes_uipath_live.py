"""
AgentSeal Live UiPath Integration Routes
----------------------------------------

Purpose:
    These endpoints prove a real live integration path:

    AgentSeal Frontend
        -> FastAPI Backend
        -> UiPath OAuth token
        -> UiPath Orchestrator StartJobs API
        -> Latest Jobs API

Security:
    - This file never returns the client secret.
    - This file never returns the raw OAuth access token.
    - Environment variables must be stored in Render/local .env only.
    - Never commit .env files to GitHub.

Required environment variables:
    UIPATH_CLIENT_ID
    UIPATH_CLIENT_SECRET
    UIPATH_SCOPES
    UIPATH_ORCHESTRATOR_URL
    UIPATH_FOLDER_ID
    UIPATH_RELEASE_KEY

Recommended optional variables:
    UIPATH_RELEASE_ID
    UIPATH_PROCESS_NAME
    UIPATH_PROCESS_KEY
    UIPATH_JOB_STRATEGY
    UIPATH_SEND_INPUT_ARGUMENTS
"""

from __future__ import annotations

import json
import os
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

load_dotenv()

router = APIRouter(
    prefix="/api/uipath/live",
    tags=["UiPath Live Integration"],
)


class StartJobRequest(BaseModel):
    """
    Small demo payload for AgentSeal.

    Important:
        Your current Maestro BPMN release has an empty input schema.
        To avoid UiPath rejecting unknown input arguments, this backend sends
        empty input arguments by default.

        If you later add input arguments to your UiPath process/BPMN, set:
            UIPATH_SEND_INPUT_ARGUMENTS=true
    """

    assessment_id: str = Field(default="AGS-1029")
    mode: str = Field(default="after")
    risk_score: int = Field(default=22)


def get_env(name: str, required: bool = True) -> str:
    """
    Read an environment variable safely.

    If required=True and the value is missing, return a clean API error
    instead of crashing the server.
    """

    value = os.getenv(name, "").strip()

    if required and not value:
        raise HTTPException(
            status_code=400,
            detail={
                "ok": False,
                "message": f"Missing required environment variable: {name}",
                "missing": name,
            },
        )

    return value


def mask_value(value: str, keep_start: int = 4, keep_end: int = 4) -> str:
    """
    Mask sensitive or semi-sensitive values for public API responses.
    """

    if not value:
        return ""

    if len(value) <= keep_start + keep_end:
        return "*" * len(value)

    return f"{value[:keep_start]}...{value[-keep_end:]}"


@router.get("/config-check")
def config_check() -> dict[str, Any]:
    """
    Check whether Render/local environment variables are configured.

    This is safe for public demo because it only returns true/false flags
    and masked non-secret values. It never returns the client secret.
    """

    required_keys = [
        "UIPATH_CLIENT_ID",
        "UIPATH_CLIENT_SECRET",
        "UIPATH_SCOPES",
        "UIPATH_ORCHESTRATOR_URL",
        "UIPATH_FOLDER_ID",
        "UIPATH_RELEASE_KEY",
    ]

    optional_keys = [
        "UIPATH_ACCOUNT_ID",
        "UIPATH_TENANT_ID",
        "UIPATH_TENANT_NAME",
        "UIPATH_TENANT_KEY",
        "UIPATH_RELEASE_ID",
        "UIPATH_PROCESS_NAME",
        "UIPATH_PROCESS_KEY",
        "UIPATH_JOB_STRATEGY",
        "UIPATH_SEND_INPUT_ARGUMENTS",
    ]

    required_status = {key: bool(os.getenv(key, "").strip()) for key in required_keys}
    optional_status = {key: bool(os.getenv(key, "").strip()) for key in optional_keys}

    return {
        "ok": all(required_status.values()),
        "service": "AgentSeal Live UiPath Integration",
        "required": required_status,
        "optional": optional_status,
        "safe_preview": {
            "orchestrator_url": get_env("UIPATH_ORCHESTRATOR_URL", required=False),
            "folder_id": get_env("UIPATH_FOLDER_ID", required=False),
            "release_key": mask_value(get_env("UIPATH_RELEASE_KEY", required=False)),
            "process_name": get_env("UIPATH_PROCESS_NAME", required=False),
            "process_key": get_env("UIPATH_PROCESS_KEY", required=False),
            "scopes": get_env("UIPATH_SCOPES", required=False),
            "job_strategy": get_env("UIPATH_JOB_STRATEGY", required=False) or "ModernJobsCount",
            "send_input_arguments": get_env("UIPATH_SEND_INPUT_ARGUMENTS", required=False) or "false",
        },
        "note": "Secrets are not returned by this endpoint.",
    }


async def request_uipath_token() -> dict[str, Any]:
    """
    Request a UiPath OAuth access token using External Application credentials.

    UiPath External App client credentials flow uses:
        POST https://cloud.uipath.com/identity_/connect/token

    Required fields:
        grant_type=client_credentials
        client_id=<Application ID>
        client_secret=<Application Secret>
        scope=<space separated scopes>
    """

    client_id = get_env("UIPATH_CLIENT_ID")
    client_secret = get_env("UIPATH_CLIENT_SECRET")
    scopes = get_env("UIPATH_SCOPES")

    token_url = "https://cloud.uipath.com/identity_/connect/token"

    form_data = {
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret,
        "scope": scopes,
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                token_url,
                data=form_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
    except httpx.HTTPError as error:
        raise HTTPException(
            status_code=502,
            detail={
                "ok": False,
                "message": "Could not reach UiPath Identity token endpoint.",
                "error": str(error),
            },
        ) from error

    if response.status_code >= 400:
        raise HTTPException(
            status_code=502,
            detail={
                "ok": False,
                "message": "UiPath OAuth token request failed.",
                "status_code": response.status_code,
                "response": response.text,
                "hint": "Check UIPATH_CLIENT_ID, UIPATH_CLIENT_SECRET, and UIPATH_SCOPES.",
            },
        )

    payload = response.json()

    return {
        "access_token": payload["access_token"],
        "token_type": payload.get("token_type", "Bearer"),
        "expires_in": payload.get("expires_in"),
        "scope": scopes,
    }


@router.post("/token-test")
async def token_test() -> dict[str, Any]:
    """
    Confirm that UiPath OAuth credentials are valid.

    This endpoint does not return the access token.
    """

    token = await request_uipath_token()

    return {
        "ok": True,
        "message": "UiPath OAuth token request succeeded.",
        "data": {
            "access_token_received": True,
            "token_type": token["token_type"],
            "expires_in": token["expires_in"],
            "scope": token["scope"],
        },
    }


def build_start_job_body(payload: StartJobRequest, strategy: str) -> dict[str, Any]:
    """
    Build UiPath StartJobs request body.

    Your current Maestro BPMN input schema is empty, so by default we send
    empty InputArguments to prevent unknown-input validation errors.

    Later, if you add input arguments in UiPath, set:
        UIPATH_SEND_INPUT_ARGUMENTS=true
    """

    release_key = get_env("UIPATH_RELEASE_KEY")

    demo_input_arguments = {
        "assessment_id": payload.assessment_id,
        "mode": payload.mode,
        "risk_score": payload.risk_score,
        "agent_name": "Customer Refund Agent",
        "source": "AgentSeal FastAPI Backend",
    }

    send_input_arguments = (
        get_env("UIPATH_SEND_INPUT_ARGUMENTS", required=False).lower() == "true"
    )

    input_arguments = demo_input_arguments if send_input_arguments else {}

    return {
        "startInfo": {
            "ReleaseKey": release_key,
            "Strategy": strategy,
            "JobsCount": 1,
            "InputArguments": json.dumps(input_arguments),
        }
    }


async def call_start_jobs(
    token: dict[str, Any],
    payload: StartJobRequest,
    strategy: str,
) -> httpx.Response:
    """
    Call UiPath Orchestrator StartJobs endpoint with one selected strategy.
    """

    orchestrator_url = get_env("UIPATH_ORCHESTRATOR_URL").rstrip("/")
    folder_id = get_env("UIPATH_FOLDER_ID")

    start_jobs_url = (
        f"{orchestrator_url}/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs"
    )

    headers = {
        "Authorization": f"Bearer {token['access_token']}",
        "Content-Type": "application/json",
        "X-UIPATH-OrganizationUnitId": folder_id,
    }

    body = build_start_job_body(payload, strategy)

    async with httpx.AsyncClient(timeout=60) as client:
        return await client.post(start_jobs_url, headers=headers, json=body)


@router.post("/start-release-gate")
async def start_release_gate(payload: StartJobRequest) -> dict[str, Any]:
    """
    Start the deployed UiPath release gate job.

    Default primary process:
        Maestro BPMN
        ReleaseKey from UIPATH_RELEASE_KEY

    Strategy:
        ModernJobsCount is tried first because your process is in a modern folder.
        If UiPath rejects that strategy, the backend retries with JobsCount.
    """

    token = await request_uipath_token()

    primary_strategy = get_env("UIPATH_JOB_STRATEGY", required=False) or "ModernJobsCount"
    fallback_strategy = "JobsCount" if primary_strategy != "JobsCount" else "ModernJobsCount"

    attempts: list[dict[str, Any]] = []

    for strategy in [primary_strategy, fallback_strategy]:
        response = await call_start_jobs(token, payload, strategy)

        if response.status_code < 400:
            return {
                "ok": True,
                "message": "Real UiPath Orchestrator job started.",
                "strategy_used": strategy,
                "release": {
                    "release_id": get_env("UIPATH_RELEASE_ID", required=False),
                    "release_key": mask_value(get_env("UIPATH_RELEASE_KEY")),
                    "process_name": get_env("UIPATH_PROCESS_NAME", required=False),
                    "process_key": get_env("UIPATH_PROCESS_KEY", required=False),
                    "folder_id": get_env("UIPATH_FOLDER_ID"),
                },
                "input_arguments_sent": (
                    get_env("UIPATH_SEND_INPUT_ARGUMENTS", required=False).lower()
                    == "true"
                ),
                "uipath_response": response.json(),
            }

        attempts.append(
            {
                "strategy": strategy,
                "status_code": response.status_code,
                "response": response.text,
            }
        )

    raise HTTPException(
        status_code=502,
        detail={
            "ok": False,
            "message": "UiPath StartJobs request failed for both strategies.",
            "attempts": attempts,
            "hints": [
                "Make sure the External App is assigned to the Shared/Solution folder.",
                "Make sure the app has OR.Jobs and OR.Execution application scopes.",
                "Make sure UIPATH_FOLDER_ID matches the folder where the process is deployed.",
                "Make sure UIPATH_RELEASE_KEY is the release key of the deployed process.",
                "If your UiPath process has no input arguments, keep UIPATH_SEND_INPUT_ARGUMENTS=false.",
            ],
        },
    )


@router.get("/jobs/latest")
async def latest_jobs(top: int = 5) -> dict[str, Any]:
    """
    Read latest UiPath jobs from the target folder.

    This is used for proof screenshots after starting the release gate job.
    """

    token = await request_uipath_token()

    orchestrator_url = get_env("UIPATH_ORCHESTRATOR_URL").rstrip("/")
    folder_id = get_env("UIPATH_FOLDER_ID")

    safe_top = max(1, min(top, 10))
    jobs_url = f"{orchestrator_url}/odata/Jobs?$top={safe_top}&$orderby=CreationTime desc"

    headers = {
        "Authorization": f"Bearer {token['access_token']}",
        "Content-Type": "application/json",
        "X-UIPATH-OrganizationUnitId": folder_id,
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(jobs_url, headers=headers)
    except httpx.HTTPError as error:
        raise HTTPException(
            status_code=502,
            detail={
                "ok": False,
                "message": "Could not reach UiPath Jobs endpoint.",
                "error": str(error),
            },
        ) from error

    if response.status_code >= 400:
        raise HTTPException(
            status_code=502,
            detail={
                "ok": False,
                "message": "UiPath latest jobs request failed.",
                "status_code": response.status_code,
                "response": response.text,
            },
        )

    data = response.json()
    jobs = data.get("value", [])

    summary = [
        {
            "Id": job.get("Id"),
            "Key": job.get("Key"),
            "State": job.get("State"),
            "ReleaseName": job.get("ReleaseName"),
            "ProcessName": job.get("ProcessName"),
            "CreationTime": job.get("CreationTime"),
            "StartTime": job.get("StartTime"),
            "EndTime": job.get("EndTime"),
        }
        for job in jobs
    ]

    return {
        "ok": True,
        "message": "Latest UiPath jobs loaded.",
        "count": len(summary),
        "jobs": summary,
        "raw": data,
    }


@router.get("/releases")
async def releases() -> dict[str, Any]:
    """
    Optional helper endpoint.

    Lists releases visible to the External App in the configured folder.
    Use this only for debugging/proof.
    """

    token = await request_uipath_token()

    orchestrator_url = get_env("UIPATH_ORCHESTRATOR_URL").rstrip("/")
    folder_id = get_env("UIPATH_FOLDER_ID")

    releases_url = (
        f"{orchestrator_url}/odata/Releases/"
        "UiPath.Server.Configuration.OData.ListReleases"
        "?$select=Id,Name,Key,ProcessKey,ProcessVersion,ProcessType,TargetRuntime"
        "&$top=25"
        "&$orderby=Name asc"
    )

    headers = {
        "Authorization": f"Bearer {token['access_token']}",
        "Content-Type": "application/json",
        "X-UIPATH-OrganizationUnitId": folder_id,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(releases_url, headers=headers)

    if response.status_code >= 400:
        raise HTTPException(
            status_code=502,
            detail={
                "ok": False,
                "message": "UiPath releases request failed.",
                "status_code": response.status_code,
                "response": response.text,
            },
        )

    data = response.json()

    safe_releases = [
        {
            "Id": item.get("Id"),
            "Name": item.get("Name"),
            "Key": mask_value(item.get("Key", "")),
            "ProcessKey": item.get("ProcessKey"),
            "ProcessVersion": item.get("ProcessVersion"),
            "ProcessType": item.get("ProcessType"),
            "TargetRuntime": item.get("TargetRuntime"),
        }
        for item in data.get("value", [])
    ]

    return {
        "ok": True,
        "message": "UiPath releases loaded.",
        "count": len(safe_releases),
        "releases": safe_releases,
    }



