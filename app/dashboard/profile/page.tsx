import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatINR } from "@/lib/utils"
import { Mail, Phone, MapPin, Calendar, ShieldCheck, User, LogOut, Wallet } from "lucide-react"
import { ProfileSignOutButton } from "./ProfileSignOutButton"

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

  const initials =
    user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?"

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          Manage your verified consumer identity and session security
        </p>
      </div>

      {/* Account Info Card */}
      <Card className="shadow-sm">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg sm:text-xl font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg sm:text-xl font-bold truncate">
                {user.name ?? "Verified Consumer"}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Member since {new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: "long" })}
              </CardDescription>
            </div>
            <Badge
              variant={
                user.kycStatus === "VERIFIED"
                  ? "success"
                  : user.kycStatus === "REJECTED"
                  ? "destructive"
                  : "pending"
              }
              className="text-xs py-1 px-2.5 uppercase font-mono tracking-wider"
            >
              {user.kycStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/50">
            <Field icon={Mail} label="Email Address" value={user.email} />
            {user.phone && <Field icon={Phone} label="Phone Number" value={user.phone} />}
            {user.city && (
              <Field
                icon={MapPin}
                label="Location / Pincode"
                value={`${user.city}${user.pincode ? `, ${user.pincode}` : ""}`}
              />
            )}
            {user.age && (
              <Field
                icon={Calendar}
                label="Demographics"
                value={`${user.age} Years • ${user.gender}`}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Earnings Summary Card */}
      <Card className="shadow-sm">
        <CardHeader className="p-4 sm:p-6 pb-3">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">Earnings Overview</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/40 border">
              <p className="text-xs text-muted-foreground font-medium">Available Balance</p>
              <p className="text-2xl font-bold mt-1 text-primary">
                {formatINR(user.walletBalance)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/40 border">
              <p className="text-xs text-muted-foreground font-medium">Total Lifetime Earnings</p>
              <p className="text-2xl font-bold mt-1 text-foreground">
                {formatINR(user.totalEarned)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Security & Logout Card */}
      <Card className="border-destructive/20 bg-card shadow-sm">
        <CardHeader className="p-4 sm:p-6 pb-3">
          <div className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-destructive" />
            <CardTitle className="text-base sm:text-lg text-foreground">Account Session & Logout</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Sign out of your active DataCo-op session on this device
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">
              Logged in as <strong className="text-foreground">{user.email}</strong>
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Securely terminates current authenticated JWT session.
            </p>
          </div>
          <ProfileSignOutButton />
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
    <div className="flex items-start gap-3 p-3 rounded-md bg-muted/30 border border-border/40">
      <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className="text-xs sm:text-sm font-semibold mt-0.5 truncate text-foreground">{value}</div>
      </div>
    </div>
  )
}
