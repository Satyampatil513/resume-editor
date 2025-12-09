"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { FileText, Plus, MoreVertical, Trash2, ExternalLink, Clock, Upload } from "lucide-react"
import { NewProjectDialog } from "@/components/dashboard/new-project-dialog"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"

interface Project {
    id: string
    name: string
    created_at: string
    updated_at?: string // Assuming this might exist or we use created_at
}

export default function DashboardPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setProjects(data || [])
        } catch (error) {
            console.error('Error fetching projects:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation() // Prevent card click
        if (!confirm('Are you sure you want to delete this project?')) return

        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', id)

            if (error) throw error
            setProjects(projects.filter(p => p.id !== id))
        } catch (error) {
            console.error('Error deleting project:', error)
        }
    }

    const handleOpenProject = (id: string) => {
        router.push(`/dashboard/editor/${id}`)
    }

    return (
        <div className="h-full overflow-y-auto p-8">
            <div className="container mx-auto space-y-8 max-w-7xl">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">My Resumes</h1>
                    <p className="text-muted-foreground">Manage and edit your resume projects.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {/* Import Resume Card */}
                    <NewProjectDialog>
                        <Card className="group relative flex flex-col items-center justify-center h-[280px] border-dashed border-2 border-white/20 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all cursor-pointer overflow-hidden backdrop-blur-sm">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/10">
                                <Upload className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="font-bold text-lg">Import Resume</h3>
                            <p className="text-sm text-muted-foreground mt-1 text-center px-4">Upload existing LaTeX zip file</p>
                        </Card>
                    </NewProjectDialog>

                    {/* Project List */}
                    {loading ? (
                        // Skeleton loading state
                        Array.from({ length: 3 }).map((_, i) => (
                            <Card key={i} className="h-[280px] animate-pulse bg-white/5 border-white/10" />
                        ))
                    ) : (
                        projects.map((project) => (
                            <Card
                                key={project.id}
                                className="group relative flex flex-col h-[280px] hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden hover:-translate-y-1"
                                onClick={() => handleOpenProject(project.id)}
                            >
                                {/* Card Header / Preview Area */}
                                <div className="flex-1 bg-gradient-to-b from-white/5 to-transparent relative p-6 flex items-center justify-center group-hover:from-white/10 transition-colors">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <div className="h-20 w-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                                        <FileText className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                                    </div>

                                    {/* Hover Actions */}
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/20 backdrop-blur hover:bg-black/40 text-white">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => handleDeleteProject(project.id, e)} className="text-red-600 focus:text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Card Content */}
                                <CardContent className="p-5 border-t border-white/10 bg-black/20 z-10">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-1.5">
                                            <h3 className="font-semibold truncate leading-none text-lg tracking-tight" title={project.name}>
                                                {project.name}
                                            </h3>
                                            <div className="flex items-center text-xs text-muted-foreground font-medium">
                                                <Clock className="mr-1.5 h-3.5 w-3.5" />
                                                {/* We'll just show created date for now as updated_at might not be on project table yet */}
                                                Created {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>

                                {/* Hover Overlay for "Open" */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                    <Button className="shadow-xl translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-primary hover:bg-primary/90 text-white font-medium px-6">
                                        Open Editor <ExternalLink className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
