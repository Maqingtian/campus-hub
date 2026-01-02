import Image from "next/image"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"

export default async function MePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Me</h1>
        <p className="mt-2 text-muted-foreground">You are not signed in.</p>
      </div>
    )
  }

  const { name, email, image } = session.user

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Me</h1>
      <div className="mt-4 flex items-center gap-4">
        {image ? (
          <Image
            alt={name ?? "User avatar"}
            className="h-14 w-14 rounded-full border object-cover"
            height={56}
            src={image}
            width={56}
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-muted text-lg font-semibold">
            {(name ?? email ?? "U").slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-lg font-medium">{name ?? "Unnamed user"}</p>
          <p className="text-sm text-muted-foreground">{email ?? "No email"}</p>
        </div>
      </div>
    </div>
  )
}
