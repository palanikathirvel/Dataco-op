import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { ResearchWizard } from "./ResearchWizard"

export default async function NewResearchPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "BRAND") redirect("/brand/login")

  // Get all distinct cohort tags for targeting
  const tags = await prisma.cohortTag.findMany({
    select: { tag: true },
    distinct: ["tag"],
    orderBy: { tag: "asc" },
  })
  const cohortTags = tags.map((t) => t.tag)

  return <ResearchWizard cohortTags={cohortTags} />
}
