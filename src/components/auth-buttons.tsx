"use client"

import { signIn, signOut } from "next-auth/react"

import { Button } from "@/components/ui/button"

type AuthButtonsProps = {
  userLabel?: string
}

export function AuthButtons({ userLabel }: AuthButtonsProps) {
  const isSignedIn = Boolean(userLabel)

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">
        {isSignedIn ? `Signed in as ${userLabel}` : "Not signed in"}
      </span>
      {isSignedIn ? (
        <Button size="sm" variant="outline" onClick={() => signOut()}>
          Sign out
        </Button>
      ) : (
        <Button size="sm" onClick={() => signIn("github")}>
          Sign in with GitHub
        </Button>
      )}
    </div>
  )
}
