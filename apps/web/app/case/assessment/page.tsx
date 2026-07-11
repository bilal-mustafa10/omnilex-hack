import fs from "fs"
import path from "path"

import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { MemoGenerator } from "@/components/memo-generator"
import { PageNav } from "@/components/page-nav"
import { deriveClaimValues, evaluate336c, type Claim } from "@/lib/rules"

type CaseData = {
  caseId: string
  client: { name: string }
  opponent: { name: string }
  status: string
  facts: {
    monthlySalaryGrossCHF: number
    unpaidOvertimeHours: number
    referenceLetterIssued: boolean
    sickLeaveStart: string
    terminationReceived: string
    sickLeaveCertified: boolean
    serviceYearsAtTermination: number
  }
  deadlines: { label: string; due: string; note: string; severity: string; ownedByFirm: boolean }[]
  claims: Claim[]
}

function loadCase(): CaseData {
  const filePath = path.resolve(process.cwd(), "../../data/case.json")
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as CaseData
}

function formatDateShort(iso: string) {
  const date = new Date(iso)
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date)
}

function daysUntil(iso: string) {
  const due = new Date(iso).setHours(0, 0, 0, 0)
  const now = new Date().setHours(0, 0, 0, 0)
  return Math.max(0, Math.ceil((due - now) / (1000 * 60 * 60 * 24)))
}

function formatCHF(value: number) {
  return new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF", maximumFractionDigits: 0 }).format(value)
}

function confidenceVariant(confidence: string) {
  if (confidence === "high") return "default"
  if (confidence === "medium") return "secondary"
  return "outline"
}

export default function Page() {
  const caseData = loadCase()
  const deadline = caseData.deadlines[0]
  const days = daysUntil(deadline.due)

  const evaluation = evaluate336c(caseData.facts)
  const derived = deriveClaimValues(caseData.facts, evaluation, caseData.claims)

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <PageNav />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">{caseData.caseId}</p>
          <h1 className="text-lg font-medium">
            {caseData.client.name} vs. {caseData.opponent.name}
          </h1>
          <p className="text-xs text-muted-foreground">Case assessment</p>
        </div>
        <Badge variant="secondary">Assessment complete</Badge>
      </div>

      <Alert variant="destructive">
        <AlertTitle>
          Statutory objection deadline: {formatDateShort(deadline.due)} (Art. 336b OR) — {days} days remaining
        </AlertTitle>
        <AlertDescription>Firm dispatching within 48h.</AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {caseData.claims.map((claim) => {
          const is336c = claim.id === "claim-336c"
          const value = is336c
            ? derived.wageContinuation
            : claim.id === "claim-overtime"
              ? derived.overtime
              : claim.id === "claim-zeugnis"
                ? derived.zeugnis
                : claim.valueCHF

          const finding = is336c ? evaluation.reasoning : claim.finding

          return (
            <Card key={claim.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>{claim.title}</CardTitle>
                    <CardDescription>{claim.statute}</CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {is336c && (
                      <Badge variant={evaluation.void ? "default" : "outline"}>
                        {evaluation.void ? "VOID — deterministic finding" : "Not void — protection expired"}
                      </Badge>
                    )}
                    <Badge variant={confidenceVariant(claim.confidence)}>
                      {claim.confidence} confidence
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-xs text-muted-foreground">{finding}</p>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium">{formatCHF(value)}</span>
                  <span className="text-xs text-muted-foreground">{claim.valueBasis}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {claim.citations.map((citation, index) => (
                    <div key={index} className="flex flex-col gap-0.5 text-xs">
                      <span className="font-medium">
                        {citation.ref} {citation.verified ? "" : "(unverified)"}
                      </span>
                      <span className="text-muted-foreground">{citation.holding}</span>
                      <span className="text-[10px] text-muted-foreground">via {citation.source}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex items-center justify-between gap-4 rounded-none bg-muted p-4">
        <span className="text-sm font-medium">Total claim value</span>
        <span className="text-lg font-semibold">{formatCHF(derived.total)}</span>
      </div>

      <MemoGenerator />
    </main>
  )
}

