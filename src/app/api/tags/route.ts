import { NextResponse } from "next/server"

import { listTags } from "@/lib/services/tags"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const tags = await listTags()
    return NextResponse.json({ ok: true, data: tags })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { ok: false, error: "Failed to load tags" },
      { status: 500 }
    )
  }
}
