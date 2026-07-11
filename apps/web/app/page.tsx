import { PageNav } from "@/components/page-nav"

export default function Page() {
  return (
    <main className="flex min-h-[calc(100svh-57px)] flex-col items-center justify-center gap-6 p-6">
      <h1 className="font-medium">Landing</h1>
      <PageNav />
    </main>
  )
}
