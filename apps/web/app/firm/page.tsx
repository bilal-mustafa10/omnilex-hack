import fs from "fs"
import path from "path"

import { FirmDashboard } from "@/components/firm-dashboard"
import type { Claim } from "@/lib/rules"

type CasesData = {
  stats: { active: number; progressedToday: number; lawyerHoursToday: number; traditionalEquivalentHours: number }
  cases: {
    id: string
    client: string
    type: string
    stage: string
    valueCHF: number
    deadlineDays?: number
    confidence: string
    flag?: boolean
    outcome?: string
  }[]
}

type CaseData = {
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
  auditLog: { ts: string; actor: string; event: string }[]
}

function loadCases(): CasesData {
  const filePath = path.resolve(process.cwd(), "../../data/cases.json")
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as CasesData
}

function loadCase(): CaseData {
  const filePath = path.resolve(process.cwd(), "../../data/case.json")
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as CaseData
}

function loadFiling(): string {
  const filePath = path.resolve(process.cwd(), "../../data/filing.js")
  const content = fs.readFileSync(filePath, "utf-8")
  const match = content.match(/export const schlichtungsgesuch = `([\s\S]*)`;\s*$/)
  return match ? match[1].trim() : ""
}

export default function Page() {
  const casesData = loadCases()
  const caseData = loadCase()
  const filingText = loadFiling()

  return (
    <FirmDashboard
      initialCases={casesData.cases}
      stats={casesData.stats}
      claimData={caseData}
      filingText={filingText}
    />
  )
}
