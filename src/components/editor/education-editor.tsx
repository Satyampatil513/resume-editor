"use client"

import { useState } from "react"
import { EducationItem } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, GripVertical } from "lucide-react"

interface EducationEditorProps {
    data: EducationItem[]
    onChange: (data: EducationItem[]) => void
}

export function EducationEditor({ data, onChange }: EducationEditorProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const addEducation = () => {
        const newItem: EducationItem = {
            id: crypto.randomUUID(),
            institution: '',
            degree: '',
            startDate: ''
        }
        onChange([...data, newItem])
        setExpandedId(newItem.id)
    }

    const updateEducation = (id: string, field: keyof EducationItem, value: any) => {
        onChange(data.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ))
    }

    const deleteEducation = (id: string) => {
        onChange(data.filter(item => item.id !== id))
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Education</h3>
                    <p className="text-sm text-muted-foreground">Add your educational background</p>
                </div>
                <Button onClick={addEducation} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                </Button>
            </div>

            {data.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-sm text-muted-foreground mb-4">No education added yet</p>
                        <Button onClick={addEducation} variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Education
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {data.map((item) => (
                        <Card key={item.id}>
                            <CardHeader className="cursor-pointer" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-2 flex-1">
                                        <GripVertical className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div className="flex-1">
                                            <CardTitle className="text-base">
                                                {item.degree || 'Untitled Degree'} {item.field && `in ${item.field}`}
                                            </CardTitle>
                                            <CardDescription>
                                                {item.institution || 'Institution'} • {item.startDate || 'Start'} - {item.endDate || 'End'}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            deleteEducation(item.id)
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </CardHeader>

                            {expandedId === item.id && (
                                <CardContent className="space-y-4 pt-0">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Institution *</Label>
                                            <Input
                                                placeholder="University Name"
                                                value={item.institution}
                                                onChange={(e) => updateEducation(item.id, 'institution', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Degree *</Label>
                                            <Input
                                                placeholder="Bachelor of Science"
                                                value={item.degree}
                                                onChange={(e) => updateEducation(item.id, 'degree', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Field of Study</Label>
                                            <Input
                                                placeholder="Computer Science"
                                                value={item.field || ''}
                                                onChange={(e) => updateEducation(item.id, 'field', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Location</Label>
                                            <Input
                                                placeholder="City, State"
                                                value={item.location || ''}
                                                onChange={(e) => updateEducation(item.id, 'location', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Start Date *</Label>
                                            <Input
                                                type="month"
                                                value={item.startDate}
                                                onChange={(e) => updateEducation(item.id, 'startDate', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>End Date</Label>
                                            <Input
                                                type="month"
                                                value={item.endDate || ''}
                                                onChange={(e) => updateEducation(item.id, 'endDate', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>GPA</Label>
                                            <Input
                                                placeholder="3.8"
                                                value={item.gpa || ''}
                                                onChange={(e) => updateEducation(item.id, 'gpa', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            placeholder="Relevant coursework, achievements, honors..."
                                            rows={2}
                                            value={item.description || ''}
                                            onChange={(e) => updateEducation(item.id, 'description', e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
