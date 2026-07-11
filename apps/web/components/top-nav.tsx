"use client"

import { usePathname, useRouter } from "next/navigation"

import { ToggleGroup, ToggleGroupItem } from "@workspace/ui/components/toggle-group"

export function TopNav() {
  const pathname = usePathname()
  const router = useRouter()

  const view = pathname === "/firm" ? "firm" : "client"

  return (
    <header className="border-b bg-background px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="font-semibold">OmniLex</span>
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(value) => {
              if (value === "firm") router.push("/firm")
              if (value === "client") router.push("/")
            }}
            variant="outline"
            size="sm"
            spacing={0}
          >
            <ToggleGroupItem value="client">Client view</ToggleGroupItem>
            <ToggleGroupItem value="firm">Firm view</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <ToggleGroup
          type="single"
          value="employment"
          variant="outline"
          size="sm"
          spacing={0}
        >
          <ToggleGroupItem value="employment">Employment</ToggleGroupItem>
          <ToggleGroupItem value="tenancy" disabled>
            Tenancy
          </ToggleGroupItem>
          <ToggleGroupItem value="debt" disabled>
            Debt claims
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </header>
  )
}
