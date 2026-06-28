# AgentSeal

**AI Agent Release Governance powered by UiPath Test Cloud, Maestro BPMN, Human Seal Gate, RiskSeal scoring, Evidence Vault, and LiveSeal monitoring.**

AgentSeal is a release-gate platform for validating AI agents before production deployment. It helps teams test whether an AI agent follows policy, protects sensitive data, resists prompt injection, avoids unsafe tool use, requires human approval when needed, and produces auditable release evidence.

This project is built as a **UiPath Test Cloud-centered proof package**. UiPath Test Manager / Test Cloud is used as the primary validation layer for AI-agent test cases, while Maestro BPMN, Human Seal Gate, Action Center-style review, Risk Case modeling, and Orchestrator-style API workflows complete the release governance loop.

---

## Project Summary

Modern AI agents can make decisions, call tools, handle customer data, and trigger real business actions. Before these agents go live, teams need a repeatable way to test, review, approve, block, and monitor them.

AgentSeal solves this by creating a structured release gate:

1. Generate AI-agent test cases.
2. Run functional, policy, privacy, tool-safety, and red-team validation.
3. Score the agent using RiskSeal.
4. Route the release through a risk-based decision gateway.
5. Require human approval for medium-risk cases.
6. Block and create remediation cases for high-risk failures.
7. Store release evidence.
8. Continue monitoring after release.

---

## Core Concept

AgentSeal validates a **Customer Refund AI Agent** before production release.

The agent must:

* Follow refund policy.
* Block duplicate refunds.
* Reject fake order IDs.
* Protect customer PII.
* Refuse prompt injection.
* Refuse system prompt leakage.
* Block unauthorized direct refund API calls.
* Require approval for high-value refunds.
* Recover safely from API timeout/fallback cases.

---

## UiPath Integration Proof

AgentSeal is submitted under the **UiPath Test Cloud** track.

UiPath is used as the release-validation and governance layer:

| AgentSeal Module  | UiPath Mapping                              | Purpose                                           |
| ----------------- | ------------------------------------------- | ------------------------------------------------- |
| Test Forge        | UiPath Test Cloud / Test Manager test cases | Generates and maps AI-agent validation cases      |
| Test Execution    | Test Cloud execution evidence               | Shows before-fix and after-fix validation results |
| Gladiator Engine  | Negative and security test data             | Creates red-team and adversarial prompts          |
| RiskSeal          | Maestro decision gateway                    | Calculates risk and routes the release            |
| Human Seal Gate   | Action Center / Human Task style review     | Requires reviewer approval for medium-risk cases  |
| Evidence Vault    | Audit evidence package                      | Stores release proof and validation records       |
| LiveSeal Monitor  | Scheduled regression monitoring             | Keeps watching the agent after release            |
| Risk Case Model   | Maestro critical remediation case           | Handles high-risk failures                        |
| Orchestrator Plan | API-driven release workflow                 | Simulates an Orchestrator-style process execution |

---

## UiPath Test Manager Proof

A UiPath Test Manager project was created:

```text
Project:
AgentSeal Refund Agent Validation

Requirement:
Customer Refund Agent Release Requirement

Test Set:
Refund Agent Release Gate
```

Test cases created in UiPath Test Manager:

```text
TC-01 Valid refund under $500
TC-02 Refund above $500 requires approval
TC-03 Refund after policy window
TC-04 Fake order ID rejection
TC-05 Duplicate refund blocked
TC-06 Customer PII request blocked
TC-07 Prompt injection refused
TC-08 System prompt leak refused
TC-09 API timeout safe fallback
TC-10 Direct refund API call blocked
```

After remediation, the final Test Manager proof shows all test cases passed.

Proof screenshots:

```text
proof-screenshots/uipath/01-test-cloud-project.png
proof-screenshots/uipath/02-test-manager-requirement.png
proof-screenshots/uipath/03-test-manager-test-cases.png
proof-screenshots/uipath/04-test-set-release-gate.png
proof-screenshots/uipath/05-before-fix-failed-results.png
proof-screenshots/uipath/06-after-fix-passed-results.png
```

---

## Maestro BPMN Release Gate

AgentSeal includes a Maestro BPMN release-gate workflow.

Main flow:

```text
Submit Agent Assessment
↓
Extract Rules via FastAPI
↓
Generate Test Forge Cases
↓
Generate Gladiator Red-Team Prompts
↓
Execute Test Cloud Run
↓
Calculate RiskSeal Score
↓
Risk Gateway
```

Risk-based routing:

```text
Low Risk:
score <= 30
→ Generate Release Certificate
→ Evidence Vault
→ LiveSeal Monitor
→ Release Approved

Medium Risk:
score 31–60
→ Human Seal Gate
→ Reviewer Decision
→ Evidence Vault
→ LiveSeal Monitor
→ Conditional Release

High Risk:
score >= 61
→ Create Maestro Risk Case
→ Developer Fix
→ Retest in Test Cloud
→ Release Blocked Until Fixed
```

Proof screenshots:

```text
proof-screenshots/uipath/07-maestro-bpmn-release-gate.png
proof-screenshots/uipath/09-agent-definition-proof.png
proof-screenshots/uipath/10-human-seal-gate-proof.png
```

---

## Human Seal Gate

The Human Seal Gate handles medium-risk releases. It pauses the release workflow and requires reviewer approval.

Reviewer fields:

```text
Assessment ID
Agent Name
Before Fix Risk
After Fix Risk
Failed Cases
Evidence Report
Certificate ID
Reviewer
Reviewer Note
```

Reviewer outcomes:

```text
Approve Seal
Request Fix
Block Release
Escalate
```

This creates a human-in-the-loop release governance process for AI agents.

---

## Backend Proof API

The backend exposes UiPath proof endpoints through FastAPI.

Base URL:

```text
http://127.0.0.1:8000
```

Swagger docs:

```text
http://127.0.0.1:8000/docs
```

Available proof endpoints:

| Method | Endpoint                         | Purpose                                 |
| ------ | -------------------------------- | --------------------------------------- |
| GET    | `/health`                        | Backend health check                    |
| GET    | `/api/uipath/health`             | UiPath proof service health             |
| GET    | `/api/uipath/proof`              | Full UiPath proof package               |
| GET    | `/api/uipath/test-cloud-map`     | Test Cloud / Test Manager mapping       |
| GET    | `/api/uipath/maestro-flow`       | Maestro BPMN flow model                 |
| GET    | `/api/uipath/action-center-task` | Human Task / Action Center style review |
| GET    | `/api/uipath/risk-case-model`    | Critical risk case model                |
| GET    | `/api/uipath/orchestrator-plan`  | Orchestrator-style workflow plan        |
| POST   | `/api/uipath/simulate-job`       | Simulated UiPath job execution          |

Backend proof screenshots:

```text
proof-screenshots/backend/01-fastapi-docs.png
proof-screenshots/backend/02-uipath-health-response.png
proof-screenshots/backend/03-uipath-proof-api-response.png
proof-screenshots/backend/04-test-cloud-map-response.png
proof-screenshots/backend/05-maestro-flow-response.png
proof-screenshots/backend/06-action-center-task-response.png
proof-screenshots/backend/07-risk-case-model-response.png
proof-screenshots/backend/08-orchestrator-plan-response.png
proof-screenshots/backend/09-simulate-uipath-job-response.png
```

---

## Frontend Pages

AgentSeal includes a Next.js frontend with dedicated proof and module pages.

Local frontend URL:

```text
http://localhost:3000
```

Important pages:

| Page                | URL                    | Purpose                           |
| ------------------- | ---------------------- | --------------------------------- |
| Dashboard           | `/`                    | Main AgentSeal dashboard          |
| UiPath Proof        | `/uipath-proof`        | UiPath integration proof page     |
| Proof Pack          | `/proof-pack`          | Final evidence package overview   |
| Backend Health      | `/backend-health`      | Backend connection and API health |
| Test Forge          | `/test-forge`          | Generated test cases              |
| Gladiator Engine    | `/gladiator-engine`    | Red-team prompt generation        |
| Test Execution      | `/test-execution`      | Test result evidence              |
| RiskSeal            | `/riskseal`            | Risk score and decision logic     |
| Human Seal Gate     | `/human-seal-gate`     | Human review workflow             |
| Evidence Vault      | `/evidence-vault`      | Evidence storage                  |
| Release Certificate | `/release-certificate` | Final release certification       |
| LiveSeal Monitor    | `/liveseal-monitor`    | Post-release monitoring           |

Frontend proof screenshots:

```text
proof-screenshots/frontend/01-uipath-proof-page.png
proof-screenshots/frontend/02-backend-health-page.png
proof-screenshots/frontend/03-proof-pack-page.png
proof-screenshots/frontend/04-dashboard-final.png
```

---

## Architecture

```text
AgentSeal Frontend
Next.js + TypeScript
        ↓
FastAPI Backend
UiPath proof routes + release simulation
        ↓
UiPath Proof Layer
Test Manager / Test Cloud
Maestro BPMN
Human Seal Gate / Action Center style review
Risk Case Model
Orchestrator-style API workflow
        ↓
Evidence Package
Screenshots
API responses
Release certificate
Risk decision trail
```

---

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind-style UI structure
* Static and dynamic proof pages

### Backend

* FastAPI
* Python
* Uvicorn
* UiPath proof service routes
* Simulated Orchestrator-style job execution

### UiPath Proof Components

* UiPath Test Manager / Test Cloud
* UiPath Studio
* Maestro BPMN
* Human Seal Gate
* Action Center-style review
* Risk Case modeling
* Orchestrator-style API workflow

---

## Project Structure

```text
agentseal/
├── app/
│   ├── assessment/
│   ├── backend-health/
│   ├── components/
│   ├── evidence-vault/
│   ├── gladiator-engine/
│   ├── human-seal-gate/
│   ├── liveseal-monitor/
│   ├── proof-pack/
│   ├── release-certificate/
│   ├── riskseal/
│   ├── test-execution/
│   ├── test-forge/
│   └── uipath-proof/
│
├── backend/
│   ├── main.py
│   ├── routes_uipath.py
│   ├── requirements.txt
│   └── services/
│       └── uipath_proof.py
│
├── docs/
│   └── uipath-diagram.pdf
│
├── lib/
│   └── agentseal/
│       └── uipath-proof-client.ts
│
├── proof-screenshots/
│   ├── backend/
│   ├── frontend/
│   └── uipath/
│
├── public/
│   ├── agentseal-logo.png
│   └── logo.png
│
├── scripts/
├── package.json
├── package-lock.json
├── README.md
└── .gitignore
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yousunlotif-bappy/agentseal.git
cd agentseal
```

---

## Run Frontend

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Build test:

```bash
npm run build
```

Expected build output includes:

```text
/ 
/backend-health
/proof-pack
/uipath-proof
/test-forge
/test-execution
/riskseal
/human-seal-gate
/evidence-vault
/release-certificate
/liveseal-monitor
```

---

## Run Backend

Go to backend folder:

```bash
cd backend
```

Create and activate virtual environment:

```bash
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install backend requirements:

```bash
pip install -r requirements.txt
```

Run FastAPI server:

```bash
uvicorn main:app --reload
```

Open Swagger docs:

```text
http://127.0.0.1:8000/docs
```

---

## Environment Variables

A sample environment file is included:

```text
backend/.env.local.example
```

Do not commit real secrets.

Ignored environment files:

```text
.env
.env.local
backend/.env
```

---

## Proof Package

The project includes a full proof package inside:

```text
proof-screenshots/
```

Proof categories:

```text
proof-screenshots/uipath
proof-screenshots/backend
proof-screenshots/frontend
```

These screenshots prove:

* UiPath Test Manager project creation.
* Requirement creation.
* 10 test cases.
* Test set assignment.
* Before-fix / after-fix validation story.
* After-fix passed result.
* Maestro BPMN release-gate flow.
* Agent Definition prompt.
* Human Seal Gate reviewer proof.
* Backend FastAPI proof endpoints.
* Frontend proof pages.

---

## Submission Proof Checklist

### UiPath Proof

* [x] UiPath Test Manager project created.
* [x] Requirement created.
* [x] 10 test cases created.
* [x] Test set created.
* [x] Test cases assigned.
* [x] Test execution proof captured.
* [x] After-fix passed proof captured.
* [x] Maestro BPMN release gate created.
* [x] Agent Definition configured.
* [x] Human Seal Gate configured.

### Backend Proof

* [x] FastAPI `/docs` running.
* [x] `/health` response 200.
* [x] `/api/uipath/proof` response 200.
* [x] `/api/uipath/test-cloud-map` response 200.
* [x] `/api/uipath/maestro-flow` response 200.
* [x] `/api/uipath/action-center-task` response 200.
* [x] `/api/uipath/risk-case-model` response 200.
* [x] `/api/uipath/orchestrator-plan` response 200.
* [x] `/api/uipath/simulate-job` response 200.

### Frontend Proof

* [x] `/uipath-proof` page created.
* [x] `/backend-health` page created.
* [x] `/proof-pack` page created.
* [x] Main dashboard created.
* [x] Frontend build passed.

### Repository Proof

* [x] Code committed.
* [x] GitHub repository pushed.
* [x] Proof screenshots included.
* [x] Build output verified.
* [x] Pycache and environment secrets ignored.

---

## Important Note

This repository includes both:

1. **Real UiPath cloud proof screenshots** from UiPath Test Manager and UiPath Studio / Maestro BPMN.
2. **Local proof-mode backend APIs** that simulate and document the AgentSeal-to-UiPath release governance mapping.

The backend proof endpoints are designed to make the UiPath integration story auditable, reviewable, and easy to validate during judging or project review.

---

## Final Positioning

AgentSeal is not only a UI concept. It is a proof-backed AI-agent release governance workflow that connects:

```text
Generated AI-agent tests
↓
UiPath Test Cloud validation
↓
RiskSeal scoring
↓
Maestro risk routing
↓
Human Seal Gate approval
↓
Evidence Vault
↓
Release Certificate
↓
LiveSeal monitoring
```

This makes AgentSeal a complete release-readiness layer for AI agents.

---

## Repository

```text
https://github.com/yousunlotif-bappy/agentseal
```

---

## Author

Built by **yousunlotif-bappy** for the AgentSeal UiPath Test Cloud proof package.



