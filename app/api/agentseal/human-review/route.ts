import { NextResponse } from "next/server";
import { agentSealMockData } from "../../../../lib/agentseal/mock-data";

/**
 * GET /api/agentseal/human-review
 * Returns mock Human Seal Gate reviewer decision.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    resource: "human-review",
    data: agentSealMockData.humanReview,
  });
}


