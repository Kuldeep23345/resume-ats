import { ResumeAnalyzer } from "@/components/home/ResumeAnalyzer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8f8f2_0%,#edf3ef_36%,#f4ecd9_68%,#efe9f2_100%)] text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <header className="flex items-center justify-between border-b border-black/10 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-[linear-gradient(145deg,var(--premium-panel),var(--premium-aubergine))] text-sm font-semibold text-white shadow-sm">
              RA
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--premium-ink)]">
                Resume Analyzer
              </p>
              <p className="text-xs text-muted-foreground">
                ATS review workspace
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-lg border border-black/10 bg-white/75 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur sm:flex">
            <span className="size-2 rounded-full bg-[var(--premium-gold)]" />
            Ready
          </div>
        </header>

        <div className="flex flex-1 items-stretch py-5 sm:py-8 xl:items-center xl:py-10">
          <ResumeAnalyzer />
        </div>
      </div>
    </main>
  );
}
