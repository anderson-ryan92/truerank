export default function AboutPage() {
  return (
    <main className="min-h-screen px-8 py-16 max-w-3xl mx-auto">
      <header className="mb-12">
        <h1 className="text-5xl font-bold mb-4">About</h1>
        <p className="text-xl text-[var(--text-secondary)]">
          Why TrueRank exists.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">The Origin</h2>
        <p className="text-[var(--foreground)] leading-relaxed mb-4">
          I got deep into biohacking and longevity a few years ago. Peptides, nootropics,
          water quality, supplement stacks. The more I researched, the more I noticed the
          same pattern: most of what I was buying was backed by marketing instead of data.
        </p>
        <p className="text-[var(--foreground)] leading-relaxed mb-4">
          I would find a supplement with a third-party tested badge and dig in only to
          discover the test was a basic four-metal screen from a lab the brand picked
          themselves. I would find bottled water brands ranked as the cleanest by health
          apps, but the rankings were built entirely on quality reports the brands published
          themselves. Nobody was actually buying products and testing them independently.
        </p>
        <p className="text-[var(--foreground)] leading-relaxed">
          The whole space was layered with marketing language that fell apart the moment
          you looked underneath it. So I decided to build what I wished existed. Not another
          aggregator. Not another scoring algorithm sitting on top of public databases.
          Actual independent testing, filmed end to end, with the data published for free.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Who This Is For</h2>
        <p className="text-[var(--foreground)] leading-relaxed">
          This is for people who already spend serious money on health optimization and
          want to know what is actually in the bottle. Biohackers, longevity-focused,
          supplement users, the kind of people who question rankings and want to see the
          methodology. Not mass market. If you want a single letter grade, this is not
          the site for you. If you want the lab report, the chain of custody, and the
          video of the testing, you are in the right place.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">What Makes This Different</h2>
        <ul className="space-y-3 text-[var(--foreground)] leading-relaxed">
          <li>
            <span className="font-semibold text-[var(--foreground)]">Actual testing.</span>{' '}
            Products purchased at retail, sent to certified labs, tested, and documented.
          </li>
          <li>
            <span className="font-semibold text-[var(--foreground)]">Full chain of custody.</span>{' '}
            Every step from purchase to lab bench is filmed and published alongside results.
          </li>
          <li>
            <span className="font-semibold text-[var(--foreground)]">Free data, free scores.</span>{' '}
            Everything is public. No paywall on findings.
          </li>
          <li>
            <span className="font-semibold text-[var(--foreground)]">No brand-paid testing.</span>{' '}
            Brands cannot pay to be tested. Brands cannot submit their own reports.
          </li>
          <li>
            <span className="font-semibold text-[var(--foreground)]">Multi-axis scoring.</span>{' '}
            Four independent axes so you can weigh what matters to you.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Contact</h2>
        <p className="text-[var(--foreground)] leading-relaxed">
          Product suggestions, lab partnership inquiries, press, or just wanting to talk
          about the space: reach out via the contact form (coming soon) or find me on X.
        </p>
      </section>
    </main>
  )
}
