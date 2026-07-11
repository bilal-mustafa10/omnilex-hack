import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  const filePath = path.resolve(process.cwd(), "../../data/case.json")
  const raw = fs.readFileSync(filePath, "utf-8")
  const data = JSON.parse(raw)
  const memo: string = data.prewrittenMemo

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const chunks = memo.split(" ")
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk + " "))
        await new Promise((resolve) => setTimeout(resolve, 15))
      }

      controller.close()
    },
  })

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}
