# AgentSeal Trust Console — Phase 1

AgentSeal is a TrustOps-style UI prototype for testing, red-teaming, risk-scoring, human-reviewing, and certifying enterprise AI agents before production.

## What is completed in Phase 1

- Premium AgentSeal dashboard UI
- New Agent Assessment page
- Dashboard navigation connected
- Placeholder pages for all workflow modules
- Sample test-case data file
- Windows-friendly setup scripts

## Required tools

Install these before running the project:

1. Node.js LTS
2. VS Code
3. Git

## Windows setup

Open PowerShell or the VS Code terminal inside the project folder.

```powershell
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Build check

```powershell
npm run build
npm run start
```

## Main routes

```text
/                      Dashboard
/assessment            New Agent Assessment
/agents                Agent inventory placeholder
/test-forge            Test generation placeholder
/gladiator-engine      Red-team prompt placeholder
/test-execution        UiPath execution placeholder
/riskseal              Risk scoring placeholder
/human-seal-gate       Human approval placeholder
/evidence-vault        Audit evidence placeholder
/release-certificate   Final certificate placeholder
```

## UiPath mapping

| UI Page | UiPath Role |
|---|---|
| Dashboard | Governance overview |
| New Agent Assessment | Maestro BPMN start |
| Test Forge | Agent Builder / coded agent creates tests |
| Gladiator Engine | Red-team agent creates adversarial prompts |
| Test Execution | UiPath Test Cloud runs tests |
| RiskSeal | Risk scoring workflow |
| Human Seal Gate | Human Task approval |
| Evidence Vault | Audit-ready evidence |
| Release Certificate | Final production seal |

## Next phase

Build the Test Forge page with generated test-case cards, category filters, and sample export data.
