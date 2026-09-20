import { NextResponse } from "next/server";
import { getServerRpcUrl } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.text();
  const upstream = await fetch(getServerRpcUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  const payload = await upstream.text();
  return new NextResponse(payload, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" },
  });
}
