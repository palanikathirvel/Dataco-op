import { LogoLoader } from "@/components/ui/logo-loader"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background/50">
      <LogoLoader
        size="lg"
        message="Loading DataCo-op..."
        submessage="Securing your verified data connection"
      />
    </div>
  )
}
