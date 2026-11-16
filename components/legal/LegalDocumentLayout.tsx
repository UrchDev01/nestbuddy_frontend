import Link from "next/link";

export interface LegalSection {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

interface LegalDocumentLayoutProps {
  title: string;
  introduction: string;
  effectiveDate: string;
  lastUpdated: string;
  sections: LegalSection[];
  numbered?: boolean;
}

export default function LegalDocumentLayout({
  title,
  introduction,
  effectiveDate,
  lastUpdated,
  sections,
  numbered = false,
}: LegalDocumentLayoutProps) {
  return (
    <div id="top" className="w-full bg-[#f7faff] text-[#163e70]">
      <header className="w-full border-b border-[#e2edf8] bg-[#eef6ff] px-5 py-12 sm:px-10 sm:py-16 lg:px-12 lg:py-20">
        <div className="w-full">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2879ef]">
            NestBuddy · Legal
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0d3157] sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-prose text-base leading-8 text-[#526b87] sm:text-lg">
            {introduction}
          </p>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-[#355d8c]">
            <p><span className="font-bold">Effective:</span> {effectiveDate}</p>
            <p><span className="font-bold">Last updated:</span> {lastUpdated}</p>
          </div>
          <p className="mt-6 inline-flex rounded-lg border border-[#e6b23b] bg-[#fff8e6] px-3 py-2 text-sm font-semibold text-[#805600]">
            Draft for completion and legal review before publication
          </p>
        </div>
      </header>

      <div className="grid w-full gap-8 px-5 py-10 sm:px-10 sm:py-14 lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)] lg:gap-12 lg:px-12">
        <details className="rounded-2xl border border-[#e2edf8] bg-white-1 p-4 lg:hidden">
          <summary className="cursor-pointer text-sm font-bold text-[#163e70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef]">
            On this page
          </summary>
          <nav aria-label="Document sections" className="mt-4">
            <SectionLinks sections={sections} numbered={numbered} />
          </nav>
        </details>

        <aside className="hidden lg:block">
          <nav
            aria-label="Document sections"
            className="sticky top-24 rounded-2xl border border-[#e2edf8] bg-white-1 p-5"
          >
            <h2 className="text-sm font-extrabold text-[#0d3157]">On this page</h2>
            <div className="mt-4">
              <SectionLinks sections={sections} numbered={numbered} />
            </div>
            <a
              href="#top"
              className="mt-5 inline-flex text-sm font-bold text-[#2879ef] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef]"
            >
              Back to top
            </a>
          </nav>
        </aside>

        <main className="min-w-0 space-y-5">
          {sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-title`}
              className="scroll-mt-28 rounded-2xl border border-[#e2edf8] bg-white-1 p-5 sm:p-7 lg:p-8"
            >
              <h2
                id={`${section.id}-title`}
                className="text-xl font-extrabold leading-snug text-[#0d3157] sm:text-2xl"
              >
                {numbered && (
                  <span className="mr-2 text-[#2879ef]">
                    {String(index + 1).padStart(2, "0")}.
                  </span>
                )}
                {section.title}
              </h2>
              <div className="mt-4 max-w-prose space-y-4 text-sm leading-7 text-[#405c7a] sm:text-base sm:leading-8">
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={`${section.id}-p-${paragraphIndex}`}>{paragraph}</p>
                ))}
                {section.bullets && (
                  <ul className="list-disc space-y-2 pl-6 marker:text-[#2879ef]">
                    {section.bullets.map((bullet, bulletIndex) => (
                      <li key={`${section.id}-li-${bulletIndex}`}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
          <div className="flex justify-end px-1 pb-4">
            <a
              href="#top"
              className="rounded-md text-sm font-bold text-[#2879ef] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef]"
            >
              Back to top
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}

function SectionLinks({
  sections,
  numbered,
}: {
  sections: LegalSection[];
  numbered: boolean;
}) {
  return (
    <ol className="space-y-2">
      {sections.map((section, index) => (
        <li key={section.id}>
          <Link
            href={`#${section.id}`}
            className="block rounded-md py-1 text-sm leading-6 text-[#355d8c] underline-offset-4 hover:text-[#1467dc] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef]"
          >
            {numbered && `${String(index + 1).padStart(2, "0")}. `}
            {section.title}
          </Link>
        </li>
      ))}
    </ol>
  );
}
