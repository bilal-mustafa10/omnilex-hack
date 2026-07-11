"use client"

import * as React from "react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { PageNav } from "@/components/page-nav"
import type { Claim } from "@/lib/rules"

type CaseRow = {
  id: string
  client: string
  type: string
  stage: string
  valueCHF: number
  deadlineDays?: number
  confidence: string
  flag?: boolean
  outcome?: string
}

type AuditEntry = {
  ts: string
  actor: string
  event: string
}

type Stats = {
  active: number
  progressedToday: number
  lawyerHoursToday: number
  traditionalEquivalentHours: number
}

type ClaimData = {
  claims: Claim[]
  facts: {
    monthlySalaryGrossCHF: number
    unpaidOvertimeHours: number
    referenceLetterIssued: boolean
    sickLeaveStart: string
    terminationReceived: string
    sickLeaveCertified: boolean
    serviceYearsAtTermination: number
  }
  auditLog: AuditEntry[]
}

const stageConfig: Record<string, { label: string; className: string }> = {
  intake: { label: "Intake", className: "bg-muted text-muted-foreground" },
  assessment: { label: "Assessment", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  awaiting_review: { label: "Awaiting review", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  demand_sent: { label: "Demand sent", className: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" },
  conciliation_scheduled: { label: "Conciliation", className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" },
  filed: { label: "Filed", className: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300" },
  resolved: { label: "Resolved", className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
}

const confidenceConfig: Record<string, { color: string; label: string }> = {
  high: { color: "bg-green-500", label: "High" },
  medium: { color: "bg-amber-500", label: "Medium" },
  low: { color: "bg-red-500", label: "Low" },
  pending: { color: "bg-gray-400", label: "Pending" },
}

const actorBadge: Record<string, string> = {
  system: "bg-muted text-muted-foreground",
  ai: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  counsel: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
}

function formatCHF(value: number) {
  return `CHF ${value.toLocaleString("en-US")}`
}

const filters = [
  { id: "all", label: "All" },
  { id: "awaiting_review", label: "Awaiting review" },
  { id: "conciliation_scheduled", label: "Conciliation" },
  { id: "filed", label: "Filed" },
  { id: "resolved", label: "Resolved" },
]

export function FirmDashboard({
  initialCases,
  stats: initialStats,
  claimData,
  filingText,
}: {
  initialCases: CaseRow[]
  stats: Stats
  claimData: ClaimData
  filingText: string
}) {
  const [cases, setCases] = React.useState(initialCases)
  const [stats, setStats] = React.useState(initialStats)
  const [activeFilter, setActiveFilter] = React.useState("all")
  const [selectedCaseId, setSelectedCaseId] = React.useState<string | null>(null)
  const [auditLog, setAuditLog] = React.useState<AuditEntry[]>(claimData.auditLog)
  const [toast, setToast] = React.useState<string | null>(null)
  const toastTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const filteredCases = activeFilter === "all"
    ? cases
    : cases.filter((c) => c.stage === activeFilter)

  const awaitingReviewCount = cases.filter((c) => c.stage === "awaiting_review").length

  const sortedByDeadline = [...cases]
    .filter((c) => c.deadlineDays !== undefined)
    .sort((a, b) => (a.deadlineDays ?? 999) - (b.deadlineDays ?? 999))
    .slice(0, 5)

  const selectedCase = cases.find((c) => c.id === selectedCaseId) ?? null

  function showToast(message: string) {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToast(message)
    toastTimeoutRef.current = setTimeout(() => setToast(null), 4000)
  }

  function handleApproveSign() {
    const now = new Date().toISOString().replace("T", " ").slice(0, 19)
    setAuditLog((prev) => [
      ...prev,
      { ts: now, actor: "counsel", event: "Reviewed & signed — RA lic. iur. D. Meier" },
    ])

    setTimeout(() => {
      setCases((prev) =>
        prev.map((c) =>
          c.id === "C-0417" ? { ...c, stage: "filed", flag: false } : c
        )
      )
      setStats((prev) => ({ ...prev, progressedToday: prev.progressedToday + 1 }))
      setSelectedCaseId(null)
      showToast("Filing dispatched to Friedensrichteramt Zürich · client notified")
    }, 600)
  }

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-4 p-4">
      <PageNav />

      {/* Stat bar */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard value={`${stats.active}`} label="active cases" />
        <StatCard value={`${stats.progressedToday}`} label="progressed today" />
        <StatCard value={`${stats.lawyerHoursToday}h`} label="lawyer time today" />
        <div className="rounded-none border p-3">
          <div className="text-2xl font-bold">~{stats.traditionalEquivalentHours}h</div>
          <div className="text-xs text-muted-foreground">traditional equivalent</div>
          <div className="text-[10px] text-muted-foreground">same caseload, billable-hour model</div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => {
          const isActive = activeFilter === f.id
          const showCount = f.id === "awaiting_review" && awaitingReviewCount > 0
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`inline-flex items-center gap-1.5 rounded-none border px-3 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {f.label}
              {showCount && (
                <span className={`inline-flex items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                  isActive ? "bg-primary-foreground/20" : "bg-amber-100 text-amber-700"
                }`}>
                  {awaitingReviewCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Case table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-2 py-2 font-medium">Case ID</th>
                <th className="px-2 py-2 font-medium">Client</th>
                <th className="px-2 py-2 font-medium">Claim type</th>
                <th className="px-2 py-2 text-right font-medium">Value</th>
                <th className="px-2 py-2 font-medium">Stage</th>
                <th className="px-2 py-2 font-medium">Deadline</th>
                <th className="px-2 py-2 font-medium">Conf.</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((row) => {
                const stage = stageConfig[row.stage] ?? { label: row.stage, className: "bg-muted text-muted-foreground" }
                const conf = confidenceConfig[row.confidence] ?? confidenceConfig.pending
                const isSara = row.id === "C-0417"
                const deadlineUrgent = row.deadlineDays !== undefined && row.deadlineDays < 10

                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedCaseId(row.id)}
                    className={`border-b transition-colors hover:bg-muted/50 cursor-pointer ${
                      row.flag ? "border-l-2 border-l-amber-400" : ""
                    } ${isSara ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}`}
                  >
                    <td className="px-2 py-2 font-mono">
                      {row.id}
                      {row.flag && (
                        <span className="ml-1.5 inline-block rounded-none bg-amber-100 px-1 py-0.5 text-[9px] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                          Needs counsel
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2 font-medium">{row.client}</td>
                    <td className="px-2 py-2 text-muted-foreground">{row.type}</td>
                    <td className="px-2 py-2 text-right font-mono">{formatCHF(row.valueCHF)}</td>
                    <td className="px-2 py-2">
                      <span className={`inline-block rounded-none px-1.5 py-0.5 text-[10px] font-medium ${stage.className}`}>
                        {stage.label}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      {row.outcome ? (
                        <span className="text-green-600 dark:text-green-400">{row.outcome}</span>
                      ) : row.deadlineDays !== undefined ? (
                        <span className={deadlineUrgent ? "text-red-600 dark:text-red-400 font-medium" : "text-muted-foreground"}>
                          in {row.deadlineDays}d
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`size-2 rounded-full ${conf.color}`} />
                        <span className="text-muted-foreground">{conf.label}</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Today's deadlines sidebar */}
        <div className="w-full shrink-0 lg:w-64">
          <div className="rounded-none border p-3">
            <h3 className="mb-3 text-xs font-semibold">Today&apos;s deadlines</h3>
            <div className="flex flex-col gap-2">
              {sortedByDeadline.map((c) => {
                const urgent = (c.deadlineDays ?? 999) < 10
                return (
                  <div key={c.id} className="flex items-center justify-between text-xs">
                    <div className="flex flex-col">
                      <span className="font-medium">{c.client}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{c.id}</span>
                    </div>
                    <span className={`font-mono font-medium ${urgent ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
                      {c.deadlineDays}d
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Review modal */}
      <Dialog open={selectedCaseId !== null} onOpenChange={(open) => { if (!open) setSelectedCaseId(null) }}>
        <DialogContent className="sm:max-w-3xl">
          {selectedCase && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selectedCase.id === "C-0417"
                    ? "Counsel review — Meier v. TechCorp AG · CHF 23,400"
                    : `${selectedCase.id} — ${selectedCase.client}`}
                </DialogTitle>
                <DialogDescription>
                  {selectedCase.id === "C-0417"
                    ? "Full case review with findings, filing document, and audit trail."
                    : `Stage: ${stageConfig[selectedCase.stage]?.label ?? selectedCase.stage} · Value: ${formatCHF(selectedCase.valueCHF)}`}
                </DialogDescription>
              </DialogHeader>

              {selectedCase.id === "C-0417" ? (
                <div className="flex flex-col gap-4">
                  {/* Findings */}
                  <div>
                    <h4 className="mb-2 text-xs font-semibold text-muted-foreground">FINDINGS</h4>
                    <div className="flex flex-col gap-2">
                      {claimData.claims.map((claim) => (
                        <div key={claim.id} className="rounded-none border p-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-xs font-medium">{claim.title}</div>
                              <div className="text-[10px] text-muted-foreground">{claim.statute}</div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-medium">{formatCHF(claim.valueCHF)}</span>
                              <span className={`size-1.5 rounded-full ${confidenceConfig[claim.confidence]?.color ?? "bg-gray-400"}`} />
                            </div>
                          </div>
                          <div className="mt-1 flex flex-col gap-0.5">
                            {claim.citations.map((cit, i) => (
                              <div key={i} className="text-[10px] text-muted-foreground">
                                {cit.ref} — <span className="italic">via {cit.source}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Filing document */}
                  <div>
                    <h4 className="mb-2 text-xs font-semibold text-muted-foreground">SCHLICHTUNGSGESUCH</h4>
                    <div className="max-h-40 overflow-y-auto whitespace-pre-wrap border p-3 font-mono text-[10px] leading-relaxed">
                      {filingText}
                    </div>
                  </div>

                  {/* Audit log */}
                  <div>
                    <h4 className="mb-2 text-xs font-semibold text-muted-foreground">AUDIT LOG</h4>
                    <div className="flex flex-col gap-1">
                      {auditLog.map((entry, i) => (
                        <div key={i} className="flex items-start gap-2 text-[10px]">
                          <span className="font-mono text-muted-foreground">{entry.ts}</span>
                          <span className={`inline-block rounded-none px-1 py-0.5 text-[9px] font-medium ${actorBadge[entry.actor] ?? "bg-muted text-muted-foreground"}`}>
                            {entry.actor}
                          </span>
                          <span>{entry.event}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action row */}
                  <DialogFooter className="flex items-center gap-2 sm:justify-end">
                    <Button variant="outline" onClick={() => setSelectedCaseId(null)}>
                      Request changes
                    </Button>
                    <Button onClick={handleApproveSign}>
                      Approve &amp; Sign
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                  <div>Client: {selectedCase.client}</div>
                  <div>Claim type: {selectedCase.type}</div>
                  <div>Value: {formatCHF(selectedCase.valueCHF)}</div>
                  <div>Confidence: {confidenceConfig[selectedCase.confidence]?.label ?? selectedCase.confidence}</div>
                  {selectedCase.outcome && <div>Outcome: {selectedCase.outcome}</div>}
                  {selectedCase.deadlineDays !== undefined && (
                    <div>Deadline: in {selectedCase.deadlineDays}d</div>
                  )}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] animate-in fade-in-0 slide-in-from-bottom-2 rounded-none border bg-popover p-3 text-sm shadow-lg">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-green-500" />
            {toast}
          </div>
        </div>
      )}
    </main>
  )
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-none border p-3">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
