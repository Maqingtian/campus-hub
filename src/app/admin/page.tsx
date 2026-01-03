import Link from "next/link"
import { getServerSession } from "next-auth"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authOptions } from "@/lib/auth"
import { isAdmin } from "@/lib/authz"
import {
  listActivitiesAdmin,
  listAnswersAdmin,
  listQuestionsAdmin,
  stats,
} from "@/lib/services/admin"

import {
  DeleteAnswerButton,
  DeleteQuestionButton,
  ToggleActivityVisibilityButton,
} from "./actions"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  const admin = isAdmin(session)

  if (!session) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <Card>
          <CardContent className="py-6">
            <p className="text-muted-foreground">
              Please sign in to access admin tools.
            </p>
            <Button asChild className="mt-4">
              <Link href="/api/auth/signin">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!admin) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <Card>
          <CardContent className="py-6">
            <p className="text-destructive">You do not have access to this page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const [statsData, questions, answers, activities] = await Promise.all([
    stats(),
    listQuestionsAdmin(10, true),
    listAnswersAdmin(10, true),
    listActivitiesAdmin(10),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-sm text-muted-foreground">
          Moderation tools and quick stats.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Users", value: statsData.users },
          { label: "Questions", value: statsData.questions },
          { label: "Answers", value: statsData.answers },
          { label: "Activities", value: statsData.activities },
          { label: "Signups", value: statsData.signups },
          { label: "Notifications", value: statsData.notifications },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-sm text-muted-foreground">
                {item.label}
              </CardTitle>
              <div className="text-2xl font-semibold">{item.value}</div>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Questions</h2>
        </div>
        <div className="space-y-3">
          {questions.map((q) => (
            <Card key={q.id}>
              <CardHeader className="flex flex-col space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">
                      <Link href={`/questions/${q.id}`} className="hover:underline">
                        {q.title}
                      </Link>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {new Date(q.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <DeleteQuestionButton id={q.id} />
                </div>
                {q.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {q.tags.map((t) => (
                      <Badge key={t.tagId} variant="secondary">
                        {t.tag.name}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                {q.deletedAt ? (
                  <p className="text-xs text-destructive">
                    Deleted at {new Date(q.deletedAt).toLocaleString()}
                  </p>
                ) : null}
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Answers</h2>
        </div>
        <div className="space-y-3">
          {answers.map((a) => (
            <Card key={a.id}>
              <CardHeader className="flex items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">
                    <Link href={`/questions/${a.questionId}`} className="hover:underline">
                      Answer to: {a.question.title}
                    </Link>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {a.content}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(a.createdAt).toLocaleString()}
                  </p>
                  {a.deletedAt ? (
                    <p className="text-xs text-destructive">
                      Deleted at {new Date(a.deletedAt).toLocaleString()}
                    </p>
                  ) : null}
                </div>
                <DeleteAnswerButton id={a.id} />
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Activities</h2>
        </div>
        <div className="space-y-3">
          {activities.map((act) => (
            <Card key={act.id}>
              <CardHeader className="flex items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{act.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{act.desc}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(act.createdAt).toLocaleString()}
                  </p>
                  {act.isHidden ? (
                    <p className="text-xs text-destructive">Hidden</p>
                  ) : null}
                </div>
                <ToggleActivityVisibilityButton id={act.id} hidden={act.isHidden} />
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
