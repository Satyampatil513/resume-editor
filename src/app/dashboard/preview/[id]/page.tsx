"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileCode, MessageSquare, Play, Layers } from "lucide-react"
import { FileTree } from "@/components/preview/file-tree"
import { PDFViewer } from "@/components/preview/pdf-viewer"
import { AIChat } from "@/components/preview/ai-chat"
import { ComponentList } from "@/components/editor/component-list"
import { Loader2 } from "lucide-react"

export default function PreviewPage() {
    const params = useParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [project, setProject] = useState<any>(null)
    const [files, setFiles] = useState<any[]>([])

    useEffect(() => {
        loadProject()
    }, [])

    const loadProject = async () => {
        try {
            const supabase = createClient()

            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Load project details
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', params.id)
                .single()

            if (error) throw error
            setProject(data)

            // Load files from Storage
            const { data: filesData, error: filesError } = await supabase
                .storage
                .from('resume-files')
                .list(`${user.id}/${params.id}`)

            if (filesError) {
                console.error('Error loading files:', filesError)
                setFiles([])
            } else {
                // Transform storage files to FileNode format
                const fileNodes: any[] = filesData?.map(file => ({
                    id: file.id,
                    name: file.name,
                    type: 'file'
                })) || []

                setFiles(fileNodes)
            }

        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Header */}
            <div className="h-14 border-b flex items-center justify-between px-4 bg-card">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-semibold">{project?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-2" />
                        Recompile
                    </Button>
                    <Button size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        AI Assistant
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="horizontal">
                    {/* File Tree Sidebar */}
                    <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                        <div className="h-full border-r bg-muted/10 flex flex-col">
                            <div className="p-4 border-b">
                                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                    <FileCode className="h-4 w-4" />
                                    Project Files
                                </div>
                            </div>
                            <div className="p-2 overflow-y-auto flex-1 border-b">
                                <FileTree files={files} />
                            </div>
                            <div className="p-4 bg-muted/5">
                                <h2 className="font-semibold text-sm flex items-center gap-2 mb-2">
                                    <Layers className="h-4 w-4" />
                                    Components
                                </h2>
                                <ComponentList />
                            </div>
                        </div>
                    </ResizablePanel>

                    <ResizableHandle />

                    {/* PDF Preview */}
                    <ResizablePanel defaultSize={50}>
                        <div className="h-full bg-muted/20 p-8 flex items-center justify-center">
                            <PDFViewer />
                        </div>
                    </ResizablePanel>

                    <ResizableHandle />

                    {/* AI Chat / Editor */}
                    <ResizablePanel defaultSize={30} minSize={20}>
                        <AIChat projectId={params.id as string} />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    )
}
