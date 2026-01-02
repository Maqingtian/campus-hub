import Link from "next/link"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const links = [
  { href: "/", label: "Home" },
  { href: "/questions", label: "Questions" },
  { href: "/activities", label: "Activities" },
  { href: "/me", label: "Me" },
]

export function SiteNav() {
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
      </div>
    </header>
  )
}
