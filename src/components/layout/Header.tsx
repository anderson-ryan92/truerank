import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b border-gray-800">
      <div className="max-w-5xl mx-auto px-8 py-5 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Optimal Source
        </Link>
        <nav className="flex items-center gap-8 text-sm">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            Categories
          </Link>
          <Link href="/lab-reports" className="text-gray-400 hover:text-white transition-colors">
            Lab Reports
          </Link>
          <Link href="/methodology" className="text-gray-400 hover:text-white transition-colors">
            Methodology
          </Link>
          <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
            About
          </Link>
        </nav>
      </div>
    </header>
  )
}
