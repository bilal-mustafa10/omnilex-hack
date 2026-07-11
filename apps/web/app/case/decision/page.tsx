import fs from "fs"
import path from "path"

import { DecisionClient } from "@/components/decision-client"

type CaseData = {
  options: {
    id: string
    label: string
    moneyCHF: number
    moneyRange?: number[]
    moneyNote: string
    timeMonths: number
    timeNote: string
    stressScore: number
    stressNote: string
    riskNote: string
    scores: { money: number; time: number; peace: number }
  }[]
  recommendationTemplates: Record<string, string>
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
  const caseData = loadCase()
  const filingText = loadFiling()

  return (
    <DecisionClient
      options={caseData.options}
      recommendationTemplates={caseData.recommendationTemplates}
      filingText={filingText}
    />
  )
}
