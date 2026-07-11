"use client"

import * as React from "react"
import { ClockIcon } from "lucide-react"

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

type Option = {
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
}

export function DecisionClient({
  options,
  recommendationTemplates,
  filingText,
}: {
  options: Option[]
  recommendationTemplates: Record<string, string>
  filingText: string
}) {
  const [sliderValue, setSliderValue] = React.useState(50)
  const [modalOpen, setModalOpen] = React.useState(false)

  const scores = options.map((option) => {
    const moneyWeight = sliderValue / 100
    const peaceWeight = (100 - sliderValue) / 100
    return moneyWeight * option.scores.money + peaceWeight * ((option.scores.time + option.scores.peace) / 2)
  })

  const recommendedIndex = scores.indexOf(Math.max(...scores))
  const recommendedOption = options[recommendedIndex] ?? options[0]

  function formatCHF(value: number) {
    return `CHF ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'")}`
  }

  function formatMoneyRange(range: number[]) {
    return `${formatCHF(range[0])}–${formatCHF(range[1])}`
  }

  function StressDots({ score }: { score: number }) {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className={`size-1.5 rounded-full ${i < score ? "bg-foreground" : "bg-muted"}`}
          />
        ))}
      </div>
    )
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 p-6">
      <PageNav />

      <div className="text-center">
        <h1 className="text-2xl font-medium">Your case is strong. Now — what do you want?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Every law firm maximizes the claim. We optimize for the outcome you choose.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {options.map((option, index) => {
          const isRecommended = index === recommendedIndex

          return (
            <Card
              key={option.id}
              className={`transition-all duration-300 ${
                isRecommended
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02]"
                  : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle>{option.label}</CardTitle>
                  {isRecommended && (
                    <Badge variant="default">Recommended for you</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <div>
                  <div className="text-2xl font-semibold">
                    {option.moneyRange ? formatMoneyRange(option.moneyRange) : formatCHF(option.moneyCHF)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {option.id === "conciliate" ? (
                      <em>{option.moneyNote}</em>
                    ) : (
                      option.moneyNote
                    )}
                  </p>
                </div>

                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ClockIcon className="mt-0.5 size-4 shrink-0" />
                  <span>{option.timeNote}</span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Stress</span>
                    <span className="text-muted-foreground">{option.stressScore}/10</span>
                  </div>
                  <StressDots score={option.stressScore} />
                  <p className="text-xs text-muted-foreground">{option.stressNote}</p>
                </div>

                <p className="text-xs text-muted-foreground">{option.riskNote}</p>

                {isRecommended && (
                  <Button className="mt-auto w-full" onClick={() => setModalOpen(true)}>
                    Proceed with this path
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mx-auto w-full max-w-2xl rounded-none bg-muted p-6">
        <div className="mb-4 flex items-center justify-between text-sm font-medium">
          <span>Peace of mind</span>
          <span>Maximum recovery</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={sliderValue}
          onChange={(e) => setSliderValue(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-none bg-background accent-primary"
          aria-label="Preference slider: peace of mind to maximum recovery"
        />
        <p className="mt-6 text-center text-sm leading-relaxed text-muted-foreground">
          {recommendationTemplates[recommendedOption.id]}
        </p>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Your deadlines remain managed by the firm regardless of your choice.
      </p>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {recommendedOption.id === "conciliate"
                ? "Schlichtungsgesuch drafted"
                : recommendedOption.id === "accept"
                  ? "Senior lawyer consultation required"
                  : "Litigation strategy session scheduled"}
            </DialogTitle>
            <DialogDescription>
              {recommendedOption.id === "conciliate"
                ? "The conciliation request is ready for your review."
                : recommendedOption.id === "accept"
                  ? "A senior lawyer will call you within 2 hours to confirm this decision."
                  : "A senior lawyer will call you within 2 hours to confirm this decision."}
            </DialogDescription>
          </DialogHeader>

          {recommendedOption.id === "conciliate" ? (
            <div className="max-h-80 overflow-y-auto whitespace-pre-wrap border p-4 font-mono text-xs leading-relaxed">
              {filingText}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              {recommendedOption.id === "accept" && (
                <p className="mb-2">
                  You&apos;d be waiving CHF 15,400 in assessed claims — we require a human
                  consultation before you sign.
                </p>
              )}
              <p>
                A senior lawyer will call you within 2 hours to confirm this decision and walk
                you through the next steps.
              </p>
            </div>
          )}

          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Submitted for review by supervising counsel</Badge>
              <span className="text-xs text-muted-foreground">
                {new Date().toLocaleString("de-CH", { dateStyle: "short", timeStyle: "short" })}
              </span>
            </div>
            <Button onClick={() => setModalOpen(false)}>Track in my case</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
