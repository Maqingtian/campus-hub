import Link from "next/link"
import { getServerSession } from "next-auth"

import { AuthButtons } from "@/components/auth-buttons"
import { Badge } from "@/components/ui/badge"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { authOptions } from "@/lib/auth"
import { unreadCount } from "@/lib/services/notifications"

const links = [
  { href: "/", label: "Home" },
  { href: "/questions", label: "Questions" },
  { href: "/activities", label: "Activities" },
  { href: "/notifications", label: "Notifications" },
  { href: "/me", label: "Me" },
  { href: "/admin", label: "Admin", adminOnly: true },
]

export async function SiteNav() {
  const session = await getServerSession(authOptions)
  const userLabel = session?.user?.name ?? session?.user?.email ?? undefined
  const userId = (session?.user as { id?: string; role?: string } | undefined)?.id
  const isAdminUser = (session?.user as { role?: string } | undefined)?.role === "ADMIN"

  let unread = 0
  if (userId && process.env.DATABASE_URL) {
    try {
      unread = await unreadCount(userId)
    } catch (error) {
      console.error("Failed to load unread notifications", error)
    }
  }

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link className="text-lg font-semibold" href="/">
          Campus Hub
        </Link>
        <NavigationMenu>
          <NavigationMenuList>
            {links.map((link) => {
              if (link.adminOnly && !isAdminUser) return null
              return (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuLink asChild>
                  <Link
                    className={navigationMenuTriggerStyle()}
                    href={link.href}
                  >
                    {link.label}
                    {link.href === "/notifications" && unread > 0 ? (
                      <Badge className="ml-2" variant="secondary">
                        {unread}
                      </Badge>
                    ) : null}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )})}
          </NavigationMenuList>
        </NavigationMenu>
        <AuthButtons userLabel={userLabel} />
      </div>
    </header>
  )
}
