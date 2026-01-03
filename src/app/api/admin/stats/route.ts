import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/authz"
import { stats } from "@/lib/services/admin"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await requireAdmin()
    const data = await stats()
    return NextResponse.json({ ok: true, data })
  } catch (error) {
    console.error(error)
    const message = error instanceof Error ? error.message : "Forbidden"
    const status = message === "Forbidden" ? 403 : 500
    return NextResponse.json({ ok: false, error: message }, { status })
  }
}
