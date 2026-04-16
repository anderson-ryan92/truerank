export default function MethodologyPage() {
  return (
    <main className="min-h-screen px-8 py-16 max-w-3xl mx-auto">
      <header className="mb-12">
        <h1 className="text-5xl font-bold mb-4">Methodology</h1>
        <p className="text-xl text-[var(--text-secondary)]">
          How we score products. No algorithms hiding behind marketing.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">The Core Principle</h2>
        <p className="text-[var(--foreground)] leading-relaxed mb-4">
          We buy products at retail. We send them to certified labs. We film the entire process.
          We publish the results. No brand-submitted reports. No aggregated public data passed off
          as independent testing. No paywall on the findings.
        </p>
        <p className="text-[var(--foreground)] leading-relaxed">
          If a product on this site has a score, it means we bought it, tested it, and can prove
          every step of the chain of custody.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Scoring Axes</h2>
        <p className="text-[var(--foreground)] leading-relaxed mb-6">
          Every product is scored on four independent axes out of 100. We do not combine these
          into a single number because doing so hides the methodology. Each axis tells you
          something different, and you decide which matters most for your situation.
        </p>

        <div className="space-y-6">
          <ScoreAxis
            name="Contaminants"
            description="How clean is the product? We test for heavy metals, PFAS, pesticides, microbials, and category-specific contaminants. Lower contamination means a higher score. A product that tests non-detect across a comprehensive panel scores 100 on this axis."
          />
          <ScoreAxis
            name="Potency"
            description="Does the product contain what the label claims, at the potency claimed? For supplements, we verify active ingredient content. For water, we verify mineral profiles match the brand's published specs. A product that matches its label exactly scores 100."
          />
          <ScoreAxis
            name="Transparency"
            description="How much does the brand disclose? Published COAs, batch-level testing, ingredient sources, manufacturing location, third-party audits. More transparency means a higher score."
          />
          <ScoreAxis
            name="Certifications"
            description="Third-party certifications that have real auditing behind them. USDA Organic, NSF, Informed Sport, Clean Label Project, ISO 17025 labs. Certifications from bodies with weak or no auditing do not count."
          />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">What We Do Not Do</h2>
        <ul className="space-y-3 text-[var(--foreground)] leading-relaxed">
          <li>
            <span className="font-semibold text-[var(--foreground)]">We do not aggregate public databases.</span>{' '}
            We do not pull EPA, FDA, or EWG data and repackage it as our testing. If a product has
            not been tested by us, it is labeled clearly as untested.
          </li>
          <li>
            <span className="font-semibold text-[var(--foreground)]">We do not take brand-submitted reports.</span>{' '}
            Brands cannot pay us to test their products. Brands cannot submit their own lab reports
            for us to display. Everything comes from our own testing.
          </li>
          <li>
            <span className="font-semibold text-[var(--foreground)]">We do not lock scores behind a paywall.</span>{' '}
            Every score, every lab report, every piece of data is free. The content is the trust.
          </li>
          <li>
            <span className="font-semibold text-[var(--foreground)]">We do not average scores into a single number.</span>{' '}
            A single score pretends the methodology is more objective than it is. Multi-axis scoring
            respects your ability to weigh the tradeoffs yourself.
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Chain of Custody</h2>
        <p className="text-[var(--foreground)] leading-relaxed">
          Every lab report on this site links to documentation of the chain of custody:
          where the product was purchased, when it was purchased, how it was transported,
          when it arrived at the lab, and who handled it. Most testing platforms cannot
          show this. We show it for every single product.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Methodology Version</h2>
        <p className="text-[var(--foreground)] leading-relaxed">
          Current version: v1.0. When we change scoring rules, we publish the new version,
          archive the old one, and rescore affected products. Every score on this site is
          tagged with the methodology version it was calculated under.
        </p>
      </section>
    </main>
  )
}

function ScoreAxis({ name, description }: { name: string; description: string }) {
  return (
    <div className="p-6 border border-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">{name}</h3>
      <p className="text-[var(--text-secondary)] leading-relaxed">{description}</p>
    </div>
  )
}
