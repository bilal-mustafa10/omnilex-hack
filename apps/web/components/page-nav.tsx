import Link from "next/link"

const pages = [
  { href: "/", label: "Landing" },
  { href: "/case/assessment", label: "Case Assessment" },
  { href: "/case/decision", label: "Case Decision" },
  { href: "/case/rehearsal", label: "Case Rehearsal" },
  { href: "/firm", label: "Firm Dashboard" },
]

export function PageNav() {
  return (
    <nav className="flex flex-wrap justify-center gap-2 text-sm">
      {pages.map((page) => (
        <Link
          key={page.href}
          href={page.href}
          className="text-muted-foreground hover:text-foreground"
        >
          {page.label}
        </Link>
      ))}
    </nav>
  )
}
