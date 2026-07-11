export type CaseFacts = {
  monthlySalaryGrossCHF: number
  unpaidOvertimeHours: number
  referenceLetterIssued: boolean
  sickLeaveStart: string
  terminationReceived: string
  sickLeaveCertified: boolean
  serviceYearsAtTermination: number
}

export type Claim = {
  id: string
  title: string
  statute: string
  finding: string
  valueCHF: number
  valueBasis: string
  confidence: string
  deterministic?: boolean
  citations: { ref: string; holding: string; source: string; verified: boolean }[]
}

export type Evaluation336c = {
  void: boolean
  protectedDays: number
  dayOfSickLeave: number
  reasoning: string
}

export function evaluate336c(facts: CaseFacts): Evaluation336c {
  const protectedDays =
    facts.serviceYearsAtTermination < 1
      ? 30
      : facts.serviceYearsAtTermination <= 5
        ? 90
        : 180

  const sickLeaveStart = new Date(facts.sickLeaveStart)
  const terminationReceived = new Date(facts.terminationReceived)
  const msPerDay = 1000 * 60 * 60 * 24

  const daysIntoSickLeave =
    Math.floor(
      (terminationReceived.getTime() - sickLeaveStart.getTime()) / msPerDay
    ) + 1

  const isVoid =
    facts.sickLeaveCertified && daysIntoSickLeave <= protectedDays && daysIntoSickLeave > 0

  const reasoning = isVoid
    ? `Termination received on day ${daysIntoSickLeave} of a medically certified incapacity. The protected period for ${facts.serviceYearsAtTermination} years of service is ${protectedDays} days. Notice served during a protected period is VOID (Art. 336c OR).`
    : `Termination received on day ${daysIntoSickLeave} of incapacity. The ${protectedDays}-day protected period has expired or the sick leave was not certified.`

  return {
    void: isVoid,
    protectedDays,
    dayOfSickLeave: daysIntoSickLeave,
    reasoning,
  }
}

export type DerivedValues = {
  wageContinuation: number
  overtime: number
  zeugnis: number
  total: number
}

export function deriveClaimValues(
  facts: CaseFacts,
  evaluation: Evaluation336c,
  claims: Claim[]
): DerivedValues {
  // Wage continuation: 2 months' gross salary if the termination is void.
  const wageContinuation = evaluation.void ? 2 * facts.monthlySalaryGrossCHF : 0

  // Overtime: statutory formula, then floored to the conservative figure in case.json.
  const overtimeClaim = claims.find((c) => c.id === "claim-overtime")
  const computedOvertime = Math.floor(
    facts.unpaidOvertimeHours * (facts.monthlySalaryGrossCHF / 173) * 1.25
  )
  const overtime = overtimeClaim
    ? Math.min(overtimeClaim.valueCHF, computedOvertime)
    : computedOvertime

  // Reference letter: ~0.5 months' salary if not issued, floored to the conservative figure in case.json.
  const zeugnisClaim = claims.find((c) => c.id === "claim-zeugnis")
  const computedZeugnis = Math.floor(0.5 * facts.monthlySalaryGrossCHF)
  const zeugnis = facts.referenceLetterIssued
    ? 0
    : zeugnisClaim
      ? Math.min(zeugnisClaim.valueCHF, computedZeugnis)
      : computedZeugnis

  return {
    wageContinuation,
    overtime,
    zeugnis,
    total: wageContinuation + overtime + zeugnis,
  }
}
