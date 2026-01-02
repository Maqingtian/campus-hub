import Link from "next/link"

import { Button } from "@/components/ui/button"
import { NavigationMenuLink } from "@/components/ui/navigation-menu"

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="rounded-2xl border bg-card px-6 py-10 shadow-sm sm:px-10">
        <p className="text-sm font-medium text-primary">Campus Hub</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
          Your campus life, organized.
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Ask questions, discover activities, and keep track of what matters on
          campus. Start by browsing existing questions or post your own.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/questions/new">Ask a question</Link>
          </Button>
          <NavigationMenuLink asChild>
            <Link
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              href="/activities"
            >
              Browse activities
            </Link>
          </NavigationMenuLink>
        </div>
      </section>
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Questions",
            description: "Find answers from classmates and staff.",
            href: "/questions",
          },
          {
            title: "Activities",
            description: "Clubs, events, and meetups around campus.",
            href: "/activities",
          },
          {
            title: "Profile",
            description: "View your session details in Me.",
            href: "/me",
          },
        ].map((item) => (
          <Link
            key={item.title}
            className="group rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/30"
            href={item.href}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold">{item.title}</p>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <span className="text-primary transition group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}
