import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, Sparkles, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground">R</span>
            </div>
            <span>ResumeEditor</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Craft the perfect resume with <span className="text-primary">AI & LaTeX</span>
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Stop fighting with formatting. Use our AI-powered editor to generate professional, ATS-friendly resumes compiled with LaTeX.
            </p>
            <div className="space-x-4">
              <Link href="/login">
                <Button size="lg" className="gap-2">
                  Start Building <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="https://github.com/Satyampatil513/resume-editor" target="_blank" rel="noreferrer">
                <Button variant="outline" size="lg">
                  GitHub
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24 rounded-3xl">
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <FileText className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">LaTeX Precision</h3>
                  <p className="text-sm text-muted-foreground">
                    Pixel-perfect typography and layout that stands out to recruiters.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <Sparkles className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">AI Assistant</h3>
                  <p className="text-sm text-muted-foreground">
                    Chat with AI to improve your bullet points and summary instantly.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <Zap className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Instant Preview</h3>
                  <p className="text-sm text-muted-foreground">
                    See changes in real-time as you edit your resume content.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by Satyam & Co.
          </p>
        </div>
      </footer>
    </div>
  )
}
