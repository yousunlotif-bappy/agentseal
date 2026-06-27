import { NextResponse } from "next/server";
import { agentSealMockData } from "../../../../lib/agentseal/mock-data";

/**
 * GET /api/agentseal/riskseal
 * Returns mock RiskSeal report.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    resource: "riskseal",
    data: agentSealMockData.riskseal,
  });
}



