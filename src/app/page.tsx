import { ResumeAnalyzer } from "@/components/home/ResumeAnalyzer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-3xl mx-auto">
        <ResumeAnalyzer />
      </div>
    </main>
  );
}
