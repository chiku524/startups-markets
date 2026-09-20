import { NextResponse } from "next/server";
import { MIN_DEPOSIT_SOL } from "@/lib/config";
import { addDeposit, getMarket } from "@/lib/store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const market = getMarket(slug);
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
      side?: "yes" | "no";
      amountSol?: number;
      txSignature?: string;
    };
    if (body.side !== "yes" && body.side !== "no") {
      return NextResponse.json({ error: "Choose YES or NO." }, { status: 400 });
    }
    if (!body.amountSol || body.amountSol < MIN_DEPOSIT_SOL) {
      return NextResponse.json(
        { error: `Minimum deposit is ${MIN_DEPOSIT_SOL} SOL.` },
        { status: 400 },
      );
    }
    if (!body.txSignature) {
      return NextResponse.json({ error: "Missing deposit transaction." }, { status: 400 });
    }
    const market = addDeposit(slug, body.side, body.amountSol);
    return NextResponse.json({ market });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Deposit failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
