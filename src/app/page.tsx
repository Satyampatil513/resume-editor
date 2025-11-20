import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, Sparkles, Zap, CheckCircle2 } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 opacity-50 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] -z-10" />

      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">ResumeEditor</span>
          </div>
          <nav className="flex items-center gap-4">
            <ModeToggle />
            <Link href="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:scale-105">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-12 md:pb-16 md:pt-20 lg:py-40 relative">
          <div className="container flex max-w-[64rem] flex-col items-center gap-8 text-center relative z-10 mx-auto px-4">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              v1.0 Now Available
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
              Craft the perfect resume with <br />
              <span className="text-gradient">AI & LaTeX Precision</span>
            </h1>

            <p className="max-w-[42rem] leading-normal text-muted-foreground text-lg sm:text-xl sm:leading-8">
              Stop fighting with formatting. Use our AI-powered editor to generate professional, ATS-friendly resumes compiled with LaTeX.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link href="/login">
                <Button size="lg" className="h-12 px-8 text-lg gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-xl shadow-primary/20 transition-all hover:scale-105">
                  Start Building Free <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="https://github.com/Satyampatil513/resume-editor" target="_blank" rel="noreferrer">
                <Button variant="outline" size="lg" className="h-12 px-8 text-lg backdrop-blur-sm bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                  View on GitHub
                </Button>
              </Link>
            </div>

            {/* Mock UI Element - Preview of the Editor */}
            <div className="mt-20 relative w-full max-w-5xl mx-auto">
              <div className="relative rounded-2xl border border-white/20 bg-gradient-to-b from-white/10 to-white/5 dark:from-white/5 dark:to-black/20 backdrop-blur-xl shadow-2xl overflow-hidden">
                {/* Mock Editor Header */}
                <div className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="flex-1 text-center text-sm text-muted-foreground font-medium">
                    Resume Editor - Coming Soon
                  </div>
                </div>

                {/* Mock Editor Content */}
                <div className="grid md:grid-cols-2 gap-0 h-[400px]">
                  {/* Left: Code Editor Mock */}
                  <div className="border-r border-white/10 bg-black/20 p-6 space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">LaTeX Source</span>
                    </div>
                    <div className="space-y-2 font-mono text-xs">
                      <div className="h-3 bg-white/10 rounded w-3/4"></div>
                      <div className="h-3 bg-white/10 rounded w-1/2"></div>
                      <div className="h-3 bg-white/10 rounded w-5/6"></div>
                      <div className="h-3 bg-white/10 rounded w-2/3"></div>
                      <div className="h-3 bg-primary/30 rounded w-4/5"></div>
                      <div className="h-3 bg-white/10 rounded w-1/2"></div>
                    </div>
                  </div>

                  {/* Right: PDF Preview Mock */}
                  <div className="bg-white/5 p-6 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="h-24 w-24 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl mx-auto flex items-center justify-center animate-pulse">
                        <FileText className="h-12 w-12 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Live PDF Preview</p>
                        <p className="text-xs text-muted-foreground mt-1">Real-time compilation with LaTeX</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative blobs behind the mock */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </section>

        <section className="container space-y-12 py-12 md:py-24 lg:py-32 relative z-10">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
              Features that give you the edge
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              We combine the power of LaTeX typesetting with the ease of a modern web editor.
            </p>
          </div>

          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all hover:-translate-y-1 duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex h-[180px] flex-col justify-between rounded-md p-2 relative z-10">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-xl">LaTeX Precision</h3>
                  <p className="text-sm text-muted-foreground">
                    Pixel-perfect typography and layout that stands out to recruiters.
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all hover:-translate-y-1 duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex h-[180px] flex-col justify-between rounded-md p-2 relative z-10">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="h-6 w-6 text-purple-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-xl">AI Assistant</h3>
                  <p className="text-sm text-muted-foreground">
                    Chat with AI to improve your bullet points and summary instantly.
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all hover:-translate-y-1 duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex h-[180px] flex-col justify-between rounded-md p-2 relative z-10">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-6 w-6 text-blue-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-xl">Instant Preview</h3>
                  <p className="text-sm text-muted-foreground">
                    See changes in real-time as you edit your resume content.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by <span className="font-semibold text-foreground">Satyam & Co.</span>
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
