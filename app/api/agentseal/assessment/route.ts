import { NextResponse } from "next/server";
import { agentSealMockData } from "../../../../lib/agentseal/mock-data";

/**
 * GET /api/agentseal/assessment
 * Returns mock assessment intake data.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    resource: "assessment",
    data: agentSealMockData.assessment,
  });
}

