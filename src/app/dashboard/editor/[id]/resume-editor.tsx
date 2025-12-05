"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { ResumeData } from "@/types/database"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Download, Sidebar as SidebarIcon, PanelLeftClose, PanelLeftOpen, Layers, User, Briefcase, GraduationCap, Code, FolderGit2, Trophy, FileText, RefreshCw, Wand2, AlertTriangle } from "lucide-react"
import { ResumePreview } from "@/components/editor/resume-preview"
import { AIChat } from "@/components/preview/ai-chat"
import { FileTree, FileNode } from "@/components/preview/file-tree"
import { ComponentList, ComponentItem } from "@/components/editor/component-list"
import { PDFViewer } from "@/components/preview/pdf-viewer"
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"

interface ResumeEditorProps {
    projectId: string
}

export function ResumeEditor({ projectId }: ResumeEditorProps) {
    const [resumeData, setResumeData] = useState<ResumeData>({})
    const [projectName, setProjectName] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [showFileTree, setShowFileTree] = useState(true)
    const [selectedSection, setSelectedSection] = useState<string | null>(null)
    const [files, setFiles] = useState<FileNode[]>([])
    const [components, setComponents] = useState<ComponentItem[]>([])
    const [isCheckingSyntax, setIsCheckingSyntax] = useState(false)
    const [isCompiling, setIsCompiling] = useState(false)
    const [pdfUrl, setPdfUrl] = useState<string | null>(null)
    const [compileError, setCompileError] = useState<string | null>(null)
    const [compileLogs, setCompileLogs] = useState<string | null>(null)
    const [isFixing, setIsFixing] = useState(false)
    const [latexCode, setLatexCode] = useState<string>("")
    const router = useRouter()

    useEffect(() => {
        loadProject()
    }, [projectId])

    const getSectionIcon = (title: string) => {
        const t = title.toLowerCase()
        if (t.includes('education')) return <GraduationCap className="h-4 w-4" />
        if (t.includes('experience') || t.includes('work') || t.includes('employment')) return <Briefcase className="h-4 w-4" />
        if (t.includes('skill') || t.includes('technolog')) return <Code className="h-4 w-4" />
        if (t.includes('project')) return <FolderGit2 className="h-4 w-4" />
        if (t.includes('achievement') || t.includes('award') || t.includes('honor')) return <Trophy className="h-4 w-4" />
        if (t.includes('personal') || t.includes('contact')) return <User className="h-4 w-4" />
        return <FileText className="h-4 w-4" />
    }

    const loadProject = async () => {
        try {
            const supabase = createClient()

            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Load project
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .single()

            if (projectError) throw projectError
            setProjectName(project.name)

            // Load files from Storage
            const { data: filesData, error: filesError } = await supabase
                .storage
                .from('resume-files')
                .list(`${user.id}/${projectId}`)

            if (filesError) {
                console.error('Error loading files:', filesError)
                setFiles([])
            } else {
                // Transform storage files to FileNode format
                const fileNodes: FileNode[] = filesData?.map(file => ({
                    id: file.id || file.name,
                    name: file.name,
                    type: file.id ? 'file' : 'folder'
                })) || []

                setFiles(fileNodes)

                // Try to find and parse main.tex
                const mainFile = fileNodes.find(f => f.name === 'main.tex')
                if (mainFile) {
                    const { data: fileContent, error: downloadError } = await supabase
                        .storage
                        .from('resume-files')
                        .download(`${user.id}/${projectId}/main.tex`)

                    if (fileContent) {
                        const text = await fileContent.text()
                        setLatexCode(text) // Store raw code
                        const { parseLatexSections } = await import('@/lib/latex-parser')
                        const parsedSections = parseLatexSections(text)

                        // Map parsed sections to component structure
                        const dynamicComponents: ComponentItem[] = parsedSections.map(section => ({
                            id: section.id,
                            name: section.title,
                            icon: getSectionIcon(section.title),
                            content: section.content
                        }))
                        setComponents(dynamicComponents)
                    }
                }
            }
        } catch (error) {
            console.error('Error loading project:', error)
            alert('Failed to load project')
        }
    }

    const saveResume = async () => {
        // Saving logic would need to update the actual .tex file in storage
        // For now, we'll just show a toast or alert
        alert("Saving functionality for LaTeX files will be implemented soon.")
    }

    const checkSyntax = async () => {
        setIsCheckingSyntax(true)
        try {
            // Get main.tex content
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data: fileContent, error: downloadError } = await supabase
                .storage
                .from('resume-files')
                .download(`${user.id}/${projectId}/main.tex`)

            if (!fileContent) throw new Error('Could not download main.tex')

            const text = await fileContent.text()

            const response = await fetch('/api/check-syntax', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: text })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Syntax check failed')
            }

            const data = await response.json()

            if (data.errors && data.errors.length > 0) {
                const errorMsg = data.errors.map((e: any) =>
                    `Line ${e.line}: ${e.message} (${e.code})`
                ).join('\n')
                alert(`Found ${data.errors.length} syntax issues:\n\n${errorMsg}`)
            } else {
                alert("No syntax errors found!")
            }

        } catch (error: any) {
            console.error('Syntax check error:', error)
            alert(`Syntax check failed: ${error.message}`)
        } finally {
            setIsCheckingSyntax(false)
        }
    }

    const autoFix = async (logs?: string, code?: string) => {
        const logsToUse = logs || compileLogs
        if (!logsToUse) return

        setIsFixing(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            let currentCode = code
            if (!currentCode) {
                // Get current content again to be safe
                const { data: fileContent } = await supabase
                    .storage
                    .from('resume-files')
                    .download(`${user.id}/${projectId}/main.tex`)

                if (!fileContent) throw new Error('Could not download main.tex')
                currentCode = await fileContent.text()
            }

            // Call Fixer API
            const response = await fetch('/api/fix-latex', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: currentCode,
                    logs: logsToUse
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fix code')
            }

            // Update the file in Supabase
            const { error: uploadError } = await supabase
                .storage
                .from('resume-files')
                .upload(`${user.id}/${projectId}/main.tex`, data.fixedCode, {
                    upsert: true,
                    contentType: 'text/x-tex'
                })

            if (uploadError) throw uploadError

            // Update local state
            setLatexCode(data.fixedCode)

            // Clear errors and re-compile
            setCompileError(null)
            setCompileLogs(null)

            // Re-compile (pass false to prevent infinite loop if fix fails)
            await compilePreview(false)

        } catch (error: any) {
            console.error('Auto-fix failed:', error)
            setCompileError(`Auto-fix failed: ${error.message}`)
        } finally {
            setIsFixing(false)
        }
    }

    const compilePreview = async (shouldAutoFix: boolean | any = true) => {
        setIsCompiling(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data: fileContent } = await supabase
                .storage
                .from('resume-files')
                .download(`${user.id}/${projectId}/main.tex`)

            if (!fileContent) throw new Error('Could not download main.tex')
            const text = await fileContent.text()

            const response = await fetch('/api/compile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: text })
            })

            if (!response.ok) {
                const errorData = await response.json()
                // Set error and logs for the UI
                setCompileError(errorData.error || 'Compilation failed')
                const logs = errorData.logs || null
                setCompileLogs(logs) // Capture logs if available

                // Auto-fix if enabled and logs are present
                if (logs && shouldAutoFix !== false) {
                    console.log("Compilation failed, attempting auto-fix...")
                    setCompileError("Compilation failed. Attempting to auto-fix with AI...")
                    await autoFix(logs, text)
                    return
                }

                throw new Error(errorData.error || 'Compilation failed')
            }

            const data = await response.json()
            if (data.pdf) {
                // Clear errors on success
                setCompileError(null)
                setCompileLogs(null)

                // Create a data URI for the PDF
                // #toolbar=0: Hides the toolbar
                // #navpanes=0: Hides the sidebar (thumbnails)
                // #view=FitH: Fits the page width
                const dataUri = `data:application/pdf;base64,${data.pdf}#toolbar=0&navpanes=0&view=FitH`
                setPdfUrl(dataUri)
            }

        } catch (error: any) {
            console.error('Compilation error:', error)
            // alert(`Compilation failed: ${error.message}`)
        } finally {
            setIsCompiling(false)
        }
    }

    return (
        <div className="h-screen flex flex-col bg-background overflow-hidden">
            {/* Header */}
            <div className="border-b bg-card shrink-0">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push('/dashboard')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowFileTree(!showFileTree)}
                            title={showFileTree ? "Hide File Tree" : "Show File Tree"}
                        >
                            {showFileTree ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
                        </Button>
                        <div>
                            <h1 className="text-lg font-semibold">{projectName}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={checkSyntax}
                            disabled={isCheckingSyntax || isCompiling}
                        >
                            <Code className="h-4 w-4 mr-2" />
                            {isCheckingSyntax ? 'Checking...' : 'Check Syntax'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={compilePreview}
                            disabled={isCompiling}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isCompiling ? 'animate-spin' : ''}`} />
                            {isCompiling ? 'Compiling...' : 'Refresh Preview'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={saveResume}
                            disabled={isSaving}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export PDF
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* File Tree Sidebar */}
                {showFileTree && (
                    <div className="w-64 border-r bg-muted/10 flex flex-col">
                        <div className="p-4 border-b">
                            <h2 className="font-semibold text-sm flex items-center gap-2">
                                <SidebarIcon className="h-4 w-4" />
                                Project Files
                            </h2>
                        </div>
                        <div className="p-2 overflow-y-auto flex-1 border-b scrollbar-thin">
                            <FileTree
                                files={files}
                                onSelect={(node) => setSelectedSection(node.id)}
                                selectedId={selectedSection}
                            />
                        </div>

                        <div className="p-4 border-b bg-muted/5">
                            <h2 className="font-semibold text-sm flex items-center gap-2 mb-2">
                                <Layers className="h-4 w-4" />
                                Components
                            </h2>
                            <ComponentList
                                onSelect={(id) => setSelectedSection(id)}
                                selectedId={selectedSection}
                                items={components.length > 0 ? components : undefined}
                            />
                        </div>
                    </div>
                )}

                {/* Resizable Panels: Chat & Preview */}
                <div className="flex-1">
                    <ResizablePanelGroup direction="horizontal">
                        <ResizablePanel defaultSize={30} minSize={20}>
                            <AIChat
                                selectedSection={selectedSection}
                                components={components}
                                currentCode={latexCode}
                                onCodeUpdate={async (newCode) => {
                                    console.log("AI updated code")
                                    setLatexCode(newCode)

                                    // Update Supabase
                                    const supabase = createClient()
                                    const { data: { user } } = await supabase.auth.getUser()
                                    if (user) {
                                        await supabase.storage
                                            .from('resume-files')
                                            .upload(`${user.id}/${projectId}/main.tex`, newCode, {
                                                upsert: true,
                                                contentType: 'text/x-tex'
                                            })

                                        // Refresh preview
                                        await compilePreview()
                                    }
                                }}
                            />
                        </ResizablePanel>

                        <ResizableHandle />

                        <ResizablePanel defaultSize={70} minSize={30}>
                            <div className="h-full bg-muted/30 scrollbar-thin overflow-hidden">
                                {/* Use PDFViewer for LaTeX projects */}
                                <div className="h-full w-full">
                                    <PDFViewer pdfUrl={pdfUrl} isLoading={isCompiling} />
                                    {compileError && (
                                        <div className="absolute bottom-4 right-4 max-w-md bg-destructive/10 border border-destructive/20 p-4 rounded-lg shadow-lg backdrop-blur-sm">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-destructive mb-1">Compilation Failed</h3>
                                                    <p className="text-xs text-destructive/80 mb-3 font-mono max-h-20 overflow-y-auto">
                                                        {compileError}
                                                    </p>
                                                    {compileLogs && (
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => autoFix()}
                                                            disabled={isFixing}
                                                            className="w-full"
                                                        >
                                                            <Wand2 className={`h-4 w-4 mr-2 ${isFixing ? 'animate-spin' : ''}`} />
                                                            {isFixing ? 'Fixing with AI...' : 'Auto-Fix with AI'}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </div>
            </div>
        </div>
    )
}
