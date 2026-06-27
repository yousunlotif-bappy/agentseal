import { NextResponse } from "next/server";
import { agentSealMockData } from "../../../../lib/agentseal/mock-data";

/**
 * GET /api/agentseal/red-team
 * Returns mock Gladiator Engine red-team prompts.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    resource: "red-team",
    data: agentSealMockData.redTeam,
  });
}


