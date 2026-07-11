import fs from "fs"
import path from "path"

import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { PageNav } from "@/components/page-nav"

type TranscriptEntry = {
  speaker: string
  text: string
}

type Persona = {
  id: string
  label: string
  initials: string
  accent: string
}

const personas: Persona[] = [
  { id: "CHAIR", label: "Chair", initials: "CH", accent: "bg-muted text-muted-foreground border-border" },
  { id: "EMPLOYER REP", label: "Employer Rep", initials: "ER", accent: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800" },
  { id: "EMPLOYEE REP", label: "Employee Rep", initials: "EM", accent: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800" },
]

function loadPrompts(): { staticTranscript: TranscriptEntry[] } {
  const filePath = path.resolve(process.cwd(), "../../data/prompts.js")
  const content = fs.readFileSync(filePath, "utf-8")
  const match = content.match(/export const staticTranscript = (\[[\s\S]*\]);/)
  if (!match) return { staticTranscript: [] }
  const fn = new Function(`return ${match[1]}`) as () => TranscriptEntry[]
  return { staticTranscript: fn() }
}

function getPersona(speaker: string): Persona | undefined {
  return personas.find((p) => speaker.startsWith(p.id))
}

function isUser(speaker: string): boolean {
  return speaker.startsWith("SARA")
}

export default function Page() {
  const { staticTranscript } = loadPrompts()

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <PageNav />

      <div>
        <h1 className="text-lg font-medium">
          Hearing rehearsal — Schlichtungsverhandlung, Friedensrichteramt Zürich
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You must attend in person (Art. 204 ZPO). Practice until the room holds no surprises.
        </p>
      </div>

      <div className="flex items-center gap-3">
        {personas.map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <div className={`flex size-8 items-center justify-center rounded-full border text-xs font-medium ${p.accent}`}>
              {p.initials}
            </div>
            <span className="text-xs text-muted-foreground">{p.label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="secondary">Session replay — Rehearsal #3</Badge>
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
          3 sessions completed · Readiness: High
        </Badge>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-col gap-3 rounded-none border p-4">
            {staticTranscript.map((entry, i) => {
              const user = isUser(entry.speaker)
              const persona = getPersona(entry.speaker)

              if (user) {
                return (
                  <div key={i} className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-muted-foreground">{entry.speaker}</span>
                    <div className="max-w-[80%] rounded-none bg-primary px-3 py-2 text-xs text-primary-foreground">
                      {entry.text}
                    </div>
                  </div>
                )
              }

              return (
                <div key={i} className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-1.5">
                    {persona && (
                      <div className={`flex size-5 items-center justify-center rounded-full border text-[9px] font-medium ${persona.accent}`}>
                        {persona.initials}
                      </div>
                    )}
                    <span className="text-[10px] text-muted-foreground">{entry.speaker}</span>
                  </div>
                  <div className={`max-w-[80%] rounded-none border px-3 py-2 text-xs ${persona?.accent ?? "border-border bg-muted text-muted-foreground"}`}>
                    {entry.text}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              disabled
              placeholder="Start new rehearsal session"
              className="flex-1 rounded-none border bg-muted/50 px-3 py-2 text-xs text-muted-foreground placeholder:text-muted-foreground"
            />
            <button
              disabled
              className="rounded-none bg-primary px-4 py-2 text-xs font-medium text-primary-foreground opacity-50"
            >
              Start live session
            </button>
          </div>
        </div>

        <div className="w-full shrink-0 lg:w-56">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Coach&apos;s notes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-3 text-xs text-muted-foreground">
                <li>Lead with Art. 336c — it&apos;s your strongest card</li>
                <li>Have the time-tracking exports ready when the overtime hours are challenged</li>
                <li>Your target corridor: CHF 15,000–18,000</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
