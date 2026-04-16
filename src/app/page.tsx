import { ResumeAnalyzer } from "@/components/home/ResumeAnalyzer";
import { FileText, Zap, Target, TrendingUp } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Resume Parsing",
    description: "Extract and analyze text from PDF and DOCX files instantly"
  },
  {
    icon: Zap,
    title: "AI-Powered Analysis",
    description: "Get instant insights using advanced AI models"
  },
  {
    icon: Target,
    title: "ATS Scoring",
    description: "Check how well your resume matches ATS systems"
  },
  {
    icon: TrendingUp,
    title: "Improvement Tips",
    description: "Receive actionable suggestions to improve your resume"
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900">
      <header className="border-b bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl">ResumeAI</span>
          </div>
        </div>
      </header>

      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Analyze Your Resume with <span className="text-blue-600">AI</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your resume and get instant feedback on how to improve it. 
            Beat the ATS systems and land your dream job.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <ResumeAnalyzer />
        </div>
      </section>

      <section className="px-6 py-20 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="h-12 w-12 mx-auto rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-6 py-8 border-t">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          ResumeAI - Smart Resume Analysis
        </div>
      </footer>
    </main>
  );
}
