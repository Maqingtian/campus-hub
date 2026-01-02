import Link from "next/link"
import { getServerSession } from "next-auth"

import { AuthButtons } from "@/components/auth-buttons"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { authOptions } from "@/lib/auth"

const links = [
  { href: "/", label: "Home" },
  { href: "/questions", label: "Questions" },
  { href: "/activities", label: "Activities" },
  { href: "/me", label: "Me" },
]

export async function SiteNav() {
  const session = await getServerSession(authOptions)
  const userLabel = session?.user?.name ?? session?.user?.email ?? undefined

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link className="text-lg font-semibold" href="/">
          Campus Hub
        </Link>
        <NavigationMenu>
          <NavigationMenuList>
            {links.map((link) => (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuLink asChild>
                  <Link
                    className={navigationMenuTriggerStyle()}
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <AuthButtons userLabel={userLabel} />
      </div>
    </header>
  )
}
