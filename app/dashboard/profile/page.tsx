import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatINR } from "@/lib/utils"
import { Mail, Phone, MapPin, Calendar, ShieldCheck } from "lucide-react"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      age: true,
      gender: true,
      city: true,
      pincode: true,
      kycStatus: true,
      walletBalance: true,
      totalEarned: true,
      createdAt: true,
    },
  })

  if (!user) redirect("/login")

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your account information
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-semibold">
              {user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?"}
            </div>
            <div>
              <CardTitle>{user.name ?? "Anonymous"}</CardTitle>
              <CardDescription>
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field icon={Mail} label="Email" value={user.email} />
            {user.phone && <Field icon={Phone} label="Phone" value={user.phone} />}
            {user.city && (
              <Field
                icon={MapPin}
                label="Location"
                value={`${user.city}${user.pincode ? `, ${user.pincode}` : ""}`}
              />
            )}
            {user.age && (
              <Field
                icon={Calendar}
                label="Age & Gender"
                value={`${user.age} • ${user.gender}`}
              />
            )}
            <Field
              icon={ShieldCheck}
              label="KYC Status"
              value={
                <Badge
                  variant={
                    user.kycStatus === "VERIFIED"
                      ? "success"
                      : user.kycStatus === "REJECTED"
                      ? "destructive"
                      : "pending"
                  }
                >
                  {user.kycStatus}
                </Badge>
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Earnings summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Available balance</p>
              <p className="text-2xl font-bold mt-1">
                {formatINR(user.walletBalance)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total earned</p>
              <p className="text-2xl font-bold mt-1">{formatINR(user.totalEarned)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-1" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium mt-0.5">{value}</div>
      </div>
    </div>
  )
}
