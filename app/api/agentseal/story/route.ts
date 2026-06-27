import { NextResponse } from "next/server";
import { agentSealMockData } from "../../../../lib/agentseal/mock-data";

/**
 * GET /api/agentseal/story
 * Returns the complete AgentSeal mock backend story.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    resource: "full-agentseal-story",
    generatedAt: new Date().toISOString(),
    data: agentSealMockData,
  });
}


