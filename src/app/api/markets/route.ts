import { NextResponse } from "next/server";
import { allMarkets, verifyAndCreateListing } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ markets: allMarkets() });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      tagline?: string;
      category?: string;
      description?: string;
      website?: string;
      founder?: string;
      question?: string;
      listingTx?: string;
      listedBy?: string;
    };

    if (
      !body.name?.trim() ||
      !body.tagline?.trim() ||
      !body.description?.trim() ||
      !body.founder?.trim() ||
      !body.listingTx?.trim() ||
      !body.listedBy?.trim()
    ) {
      return NextResponse.json(
        { error: "Missing required listing fields." },
        { status: 400 },
      );
    }

    const market = await verifyAndCreateListing({
      name: body.name,
      tagline: body.tagline,
      category: body.category ?? "Other",
      description: body.description,
      website: body.website,
      founder: body.founder,
      question: body.question ?? "",
      listingTx: body.listingTx,
      listedBy: body.listedBy,
    });

    return NextResponse.json({ market });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Listing failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
