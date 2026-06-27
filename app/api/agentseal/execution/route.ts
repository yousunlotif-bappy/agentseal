import { NextResponse } from "next/server";
import { agentSealMockData } from "../../../../lib/agentseal/mock-data";

/**
 * GET /api/agentseal/execution
 * Returns mock test execution results.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    resource: "execution",
    data: agentSealMockData.execution,
  });
}


