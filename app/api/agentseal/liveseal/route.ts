import { NextResponse } from "next/server";
import { agentSealMockData } from "../../../../lib/agentseal/mock-data";

/**
 * GET /api/agentseal/liveseal
 * Returns mock LiveSeal Monitor data.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    resource: "liveseal",
    data: agentSealMockData.liveseal,
  });
}


