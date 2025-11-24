"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Upload, Loader2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

export function NewProjectDialog({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [projectName, setProjectName] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [zipFile, setZipFile] = useState<File | null>(null)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.name.endsWith('.zip')) {
                setError('Please upload a .zip file')
                return
            }
            setZipFile(file)
            setError(null)
            // Auto-fill project name from filename
            if (!projectName) {
                setProjectName(file.name.replace('.zip', ''))
            }
        }
    }

    const handleUpload = async () => {
        if (!projectName.trim() || !zipFile) {
            setError('Please provide a project name and select a ZIP file')
            return
        }

        setIsUploading(true)
        setError(null)

        try {
            console.log('Starting upload process...')
            console.log('Supabase URL present:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
            console.log('Supabase Anon Key present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

            const supabase = createClient()

            // Get current user
            const { data: { user }, error: authError } = await supabase.auth.getUser()

            if (authError) {
                console.error('Auth error:', authError)
                throw authError
            }

            if (!user) {
                console.log('No user found, redirecting...')
                router.push('/login')
                throw new Error("Not authenticated. Redirecting to login...")
            }

            console.log('User authenticated:', user.id)

            // Create project
            console.log('Creating project...')
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .insert({
                    user_id: user.id,
                    name: projectName
                })
                .select()
                .single()

            if (projectError) {
                console.error('Project creation error:', projectError)
                throw projectError
            }

            console.log('Project created:', project.id)

            // Upload zip file to Supabase Storage
            const filePath = `${user.id}/${project.id}/${zipFile.name}`
            console.log('Uploading file to storage:', filePath)

            const { error: uploadError } = await supabase.storage
                .from('resume-files')
                .upload(filePath, zipFile)

            if (uploadError) {
                throw uploadError
            }

            console.log('File uploaded successfully')

            // Create artifact record
            console.log('Creating artifact record...')
            const { error: artifactError } = await supabase
                .from('artifacts')
                .insert({
                    project_id: project.id,
                    storage_path: filePath,
                    file_type: 'zip',
                    user_id: user.id
                })

            if (artifactError) {
                console.error('Artifact creation error:', artifactError)
                // Try to delete the project if artifact creation fails to avoid orphans? 
                // For now just log it.
                throw artifactError
            }

            console.log('Artifact created successfully')

            // Create job to process the zip file
            const { error: jobError } = await supabase
                .from('jobs')
                .insert({
                    project_id: project.id,
                    status: 'queued',
                    user_id: user.id
                })

            if (jobError) throw jobError

            // Navigate to preview page
            router.push(`/dashboard/preview/${project.id}`)
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
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Project
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Upload Resume Project</DialogTitle>
                    <DialogDescription>
                        Upload a .zip file containing your LaTeX resume (e.g., from Overleaf)
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name">Project Name</Label>
                        <Input
                            id="name"
                            placeholder="My Resume"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            disabled={isUploading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="zip-file">Resume ZIP File</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="zip-file"
                                type="file"
                                accept=".zip"
                                onChange={handleFileChange}
                                disabled={isUploading}
                                className="cursor-pointer"
                            />
                        </div>
                        {zipFile && (
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                {zipFile.name} ({(zipFile.size / 1024).toFixed(2)} KB)
                            </p>
                        )}
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                        <h4 className="font-medium text-sm">How to get your ZIP file:</h4>
                        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                            <li>Open your resume project in Overleaf</li>
                            <li>Click "Menu" → "Download" → "Source"</li>
                            <li>Upload the downloaded .zip file here</li>
                        </ol>
                    </div>

                    <Button
                        onClick={handleUpload}
                        disabled={isUploading || !projectName.trim() || !zipFile}
                        className="w-full"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading to Supabase...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload & Continue
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
