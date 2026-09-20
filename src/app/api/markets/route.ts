import { NextResponse } from "next/server";
import { allMarkets, verifyAndCreateListing } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const markets = await allMarkets();
  return NextResponse.json({ markets });
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
      slug?: string;
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
      slug: body.slug,
    });

    return NextResponse.json({ market });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Listing failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
