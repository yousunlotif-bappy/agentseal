import { NextResponse } from "next/server";
import { agentSealMockData } from "../../../../lib/agentseal/mock-data";

/**
 * GET /api/agentseal/certificate
 * Returns mock Release Certificate data.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    resource: "certificate",
    data: agentSealMockData.certificate,
  });
}



