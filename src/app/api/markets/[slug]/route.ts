import { NextResponse } from "next/server";
import { getMarket, verifyAndAddDeposit } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const market = await getMarket(slug);
  if (!market) {
    return NextResponse.json({ error: "Market not found." }, { status: 404 });
  }
  return NextResponse.json({ market });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  try {
    const body = (await request.json()) as {
      txSignature?: string;
    };
    if (!body.txSignature) {
      return NextResponse.json({ error: "Missing deposit transaction." }, { status: 400 });
    }
    const market = await verifyAndAddDeposit(slug, body.txSignature);
    return NextResponse.json({ market });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Deposit failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
