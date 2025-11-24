"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { ResumeData } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Save, Download, Eye, Code } from "lucide-react"
import { PersonalInfoEditor } from "@/components/editor/personal-info-editor"
import { ExperienceEditor } from "@/components/editor/experience-editor"
import { EducationEditor } from "@/components/editor/education-editor"
import { SkillsEditor } from "@/components/editor/skills-editor"
import { ResumePreview } from "@/components/editor/resume-preview"

interface ResumeEditorProps {
    projectId: string
}

export function ResumeEditor({ projectId }: ResumeEditorProps) {
    const [resumeData, setResumeData] = useState<ResumeData>({})
    const [projectName, setProjectName] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [showPreview, setShowPreview] = useState(true)
    const router = useRouter()

    useEffect(() => {
        loadProject()
    }, [projectId])

    const loadProject = async () => {
        try {
            const supabase = createClient()

            // Load project
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .single()

            if (projectError) throw projectError
            setProjectName(project.name)

            // Load resume content
            const { data: content, error: contentError } = await supabase
                .from('resume_content')
                .select('*')
                .eq('project_id', projectId)
                .single()

            if (contentError && contentError.code !== 'PGRST116') {
                throw contentError
            }

            if (content) {
                setResumeData(content.content as ResumeData)
            }
        } catch (error) {
            console.error('Error loading project:', error)
            alert('Failed to load project')
        }
    }

    const saveResume = async () => {
        setIsSaving(true)
        try {
            const supabase = createClient()

            const { error } = await supabase
                .from('resume_content')
                .upsert({
                    project_id: projectId,
                    content: resumeData
                }, {
                    onConflict: 'project_id'
                })

            if (error) throw error
        } catch (error) {
            console.error('Error saving resume:', error)
            alert('Failed to save resume')
        } finally {
            setIsSaving(false)
        }
    }

    const updateResumeData = (section: keyof ResumeData, data: any) => {
        setResumeData(prev => ({
            ...prev,
            [section]: data
        }))
    }

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push('/dashboard')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-semibold">{projectName}</h1>
                            <p className="text-sm text-muted-foreground">Resume Editor</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPreview(!showPreview)}
                        >
                            {showPreview ? <Code className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                            {showPreview ? 'Hide Preview' : 'Show Preview'}
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

            {/* Editor Content */}
            <div className="flex-1 overflow-hidden">
                <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-0">
                    {/* Editor Panel */}
                    <div className="overflow-y-auto border-r">
                        <div className="p-6">
                            <Tabs defaultValue="personal" className="w-full">
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="personal">Personal</TabsTrigger>
                                    <TabsTrigger value="experience">Experience</TabsTrigger>
                                    <TabsTrigger value="education">Education</TabsTrigger>
                                    <TabsTrigger value="skills">Skills</TabsTrigger>
                                </TabsList>

                                <TabsContent value="personal" className="mt-6">
                                    <PersonalInfoEditor
                                        data={resumeData.personal}
                                        onChange={(data) => updateResumeData('personal', data)}
                                    />
                                </TabsContent>

                                <TabsContent value="experience" className="mt-6">
                                    <ExperienceEditor
                                        data={resumeData.experience || []}
                                        onChange={(data) => updateResumeData('experience', data)}
                                    />
                                </TabsContent>

                                <TabsContent value="education" className="mt-6">
                                    <EducationEditor
                                        data={resumeData.education || []}
                                        onChange={(data) => updateResumeData('education', data)}
                                    />
                                </TabsContent>

                                <TabsContent value="skills" className="mt-6">
                                    <SkillsEditor
                                        data={resumeData.skills || []}
                                        onChange={(data) => updateResumeData('skills', data)}
                                    />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>

                    {/* Preview Panel */}
                    {showPreview && (
                        <div className="overflow-y-auto bg-muted/30">
                            <div className="p-6">
                                <Card className="max-w-[210mm] mx-auto bg-white dark:bg-card">
                                    <ResumePreview data={resumeData} />
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
