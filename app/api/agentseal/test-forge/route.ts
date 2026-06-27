import { NextResponse } from "next/server";
import { agentSealMockData } from "../../../../lib/agentseal/mock-data";

/**
 * GET /api/agentseal/test-forge
 * Returns mock Test Forge generated test cases.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    resource: "test-forge",
    data: agentSealMockData.testForge,
  });
}


