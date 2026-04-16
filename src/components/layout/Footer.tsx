export function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-24">
      <div className="max-w-5xl mx-auto px-8 py-12 text-sm text-gray-500">
        <div className="flex justify-between items-center">
          <p>© {new Date().getFullYear()} TrueRank. Independent lab testing.</p>
          <p className="text-xs text-gray-600">
            Full chain of custody. No brand-paid testing.
          </p>
        </div>
      </div>
    </footer>
  )
}
