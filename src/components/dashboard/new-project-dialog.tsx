"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Upload, Loader2, UploadCloud, AlertCircle, FileText, CheckCircle2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { cn } from "@/lib/utils"

export function NewProjectDialog({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [projectName, setProjectName] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [zipFile, setZipFile] = useState<File | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleFile(file)
    }

    const handleFile = (file: File) => {
        if (!file.name.endsWith('.zip')) {
            setError('Please upload a .zip file')
            return
        }
        setZipFile(file)
        setError(null)
        if (!projectName) {
            setProjectName(file.name.replace('.zip', ''))
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) handleFile(file)
    }

    const handleUpload = async () => {
        if (!projectName.trim() || !zipFile) {
            setError('Please provide a project name and select a ZIP file')
            return
        }

        setIsUploading(true)
        setError(null)

        try {
            const supabase = createClient()
            const { data: { user }, error: authError } = await supabase.auth.getUser()

            if (authError) throw authError
            if (!user) {
                router.push('/login')
                throw new Error("Not authenticated. Redirecting to login...")
            }

            // Create project
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .insert({ user_id: user.id, name: projectName })
                .select()
                .single()

            if (projectError) throw projectError

            // Unzip and upload files
            const jszip = (await import('jszip')).default
            const zip = await jszip.loadAsync(zipFile)

            const uploadPromises: Promise<any>[] = []

            // Also upload the original zip as backup
            const zipPath = `${user.id}/${project.id}/${zipFile.name}`
            uploadPromises.push(
                supabase.storage
                    .from('resume-files')
                    .upload(zipPath, zipFile)
            )

            // Iterate through files in zip
            zip.forEach((relativePath, zipEntry) => {
                if (!zipEntry.dir) {
                    uploadPromises.push(async function () {
                        const content = await zipEntry.async('blob')
                        const filePath = `${user.id}/${project.id}/${relativePath}`
                        return supabase.storage
                            .from('resume-files')
                            .upload(filePath, content, {
                                contentType: 'text/plain', // Default to text/plain for tex files, or auto-detect if needed
                                upsert: true
                            })
                    }())
                }
            })

            await Promise.all(uploadPromises)

            // Create artifact record for the zip
            const { error: artifactError } = await supabase
                .from('artifacts')
                .insert({
                    project_id: project.id,
                    storage_path: zipPath,
                    file_type: 'zip',
                    user_id: user.id
                })

            if (artifactError) throw artifactError

            // Create job
            const { error: jobError } = await supabase
                .from('jobs')
                .insert({
                    project_id: project.id,
                    status: 'queued',
                    user_id: user.id
                })

            if (jobError) throw jobError

            router.push(`/dashboard/editor/${project.id}`)
        } catch (error: any) {
            console.error('Error uploading zip:', error)
            setError(error.message || 'Failed to upload. Please try again.')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                        <Upload className="h-4 w-4" />
                        Import Resume
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[750px] bg-black/80 backdrop-blur-xl border-white/10 text-white shadow-2xl p-0 overflow-hidden gap-0">
                {/* Header Gradient Line */}
                <div className="h-1 w-full bg-gradient-to-r from-primary via-purple-500 to-blue-500" />

                <div className="p-8">
                    <DialogHeader className="mb-8">
                        <DialogTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <span className="p-2 rounded-lg bg-white/5 border border-white/10">
                                <UploadCloud className="h-5 w-5 text-primary" />
                            </span>
                            Import Resume
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-base">
                            Upload your existing LaTeX project to get started.
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <div className="mb-6 p-4 text-sm text-red-400 bg-red-500/10 rounded-lg border border-red-500/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Left Column: Upload */}
                        <div className="space-y-3">
                            <Label className="text-xs font-medium text-gray-300 uppercase tracking-wider">Resume Source File (.zip)</Label>

                            {!zipFile ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={cn(
                                        "h-[240px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group",
                                        isDragging
                                            ? "border-primary bg-primary/10 scale-[1.02]"
                                            : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                                    )}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".zip"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <div className="flex flex-col items-center gap-4 p-4">
                                        <div className={cn(
                                            "h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300",
                                            isDragging ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground group-hover:scale-110 group-hover:text-primary group-hover:bg-primary/10"
                                        )}>
                                            <Upload className="h-8 w-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-medium text-sm">Drag & drop or click to upload</p>
                                            <p className="text-xs text-muted-foreground">ZIP files only (max 10MB)</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[240px] relative group overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 flex flex-col items-center justify-center text-center gap-4">
                                    <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                                        <FileText className="h-8 w-8 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium truncate max-w-[200px]">{zipFile.name}</p>
                                        <p className="text-xs text-muted-foreground">{(zipFile.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setZipFile(null)
                                            setProjectName("")
                                        }}
                                        disabled={isUploading}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    >
                                        Remove File
                                    </Button>

                                    {/* Success Indicator */}
                                    <div className="absolute right-3 top-3">
                                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Details */}
                        <div className="flex flex-col justify-between h-[265px]">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-xs font-medium text-gray-300 uppercase tracking-wider">Project Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Software Engineer Resume"
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                        disabled={isUploading}
                                        className="bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all h-11"
                                    />
                                </div>

                                {/* Info Box */}
                                <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-4 flex gap-3">
                                    <div className="mt-0.5">
                                        <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <span className="text-xs font-bold text-blue-400">i</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-blue-300">Overleaf Export</p>
                                        <p className="text-xs text-blue-300/70 leading-relaxed">
                                            Export from Overleaf: &quot;Menu&quot; → &quot;Download&quot; → &quot;Source&quot;.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleUpload}
                                disabled={isUploading || !projectName.trim() || !zipFile}
                                className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        Import Resume
                                        <CheckCircle2 className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
