"use client"

import * as React from "react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Spinner } from "@workspace/ui/components/spinner"

export function MemoGenerator() {
  const [memo, setMemo] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  async function generate() {
    setIsLoading(true)
    setMemo("")

    const response = await fetch("/api/memo")
    const reader = response.body?.getReader()
    if (!reader) return

    const decoder = new TextDecoder()
    let done = false

    while (!done) {
      const { value, done: streamDone } = await reader.read()
      done = streamDone
      if (value) {
        setMemo((prev) => prev + decoder.decode(value, { stream: true }))
      }
    }

    setIsLoading(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <Button onClick={generate} disabled={isLoading} className="self-start">
        {isLoading && <Spinner data-icon="inline-start" />}
        {isLoading ? "Drafting via reasoning engine…" : "Generate legal memo"}
      </Button>
      {memo && (
        <Card>
          <CardHeader>
            <CardTitle>Legal assessment memo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
              {memo}
            </div>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Subject to review by supervising counsel
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
