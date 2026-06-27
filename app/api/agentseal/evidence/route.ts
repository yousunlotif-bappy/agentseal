import { NextResponse } from "next/server";
import { agentSealMockData } from "../../../../lib/agentseal/mock-data";

/**
 * GET /api/agentseal/evidence
 * Returns mock Evidence Vault report.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    resource: "evidence",
    data: agentSealMockData.evidence,
  });
}



