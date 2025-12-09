"use client"

import { useState } from "react"
import { ExperienceItem } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface ExperienceEditorProps {
    data: ExperienceItem[]
    onChange: (data: ExperienceItem[]) => void
}

export function ExperienceEditor({ data, onChange }: ExperienceEditorProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const addExperience = () => {
        const newItem: ExperienceItem = {
            id: crypto.randomUUID(),
            company: '',
            position: '',
            startDate: '',
            current: false
        }
        onChange([...data, newItem])
        setExpandedId(newItem.id)
    }

    const updateExperience = (id: string, field: keyof ExperienceItem, value: any) => {
        onChange(data.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ))
    }

    const deleteExperience = (id: string) => {
        onChange(data.filter(item => item.id !== id))
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Work Experience</h3>
                    <p className="text-sm text-muted-foreground">Add your professional experience</p>
                </div>
                <Button onClick={addExperience} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                </Button>
            </div>

            {data.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-sm text-muted-foreground mb-4">No experience added yet</p>
                        <Button onClick={addExperience} variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Experience
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
                                                {item.position || 'Untitled Position'} {item.company && `at ${item.company}`}
                                            </CardTitle>
                                            <CardDescription>
                                                {item.startDate || 'Start date'} - {item.current ? 'Present' : (item.endDate || 'End date')}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            deleteExperience(item.id)
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
                                            <Label>Position *</Label>
                                            <Input
                                                placeholder="Software Engineer"
                                                value={item.position}
                                                onChange={(e) => updateExperience(item.id, 'position', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Company *</Label>
                                            <Input
                                                placeholder="Tech Corp"
                                                value={item.company}
                                                onChange={(e) => updateExperience(item.id, 'company', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Location</Label>
                                        <Input
                                            placeholder="San Francisco, CA"
                                            value={item.location || ''}
                                            onChange={(e) => updateExperience(item.id, 'location', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Start Date *</Label>
                                            <Input
                                                type="month"
                                                value={item.startDate}
                                                onChange={(e) => updateExperience(item.id, 'startDate', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>End Date</Label>
                                            <Input
                                                type="month"
                                                value={item.endDate || ''}
                                                onChange={(e) => updateExperience(item.id, 'endDate', e.target.value)}
                                                disabled={item.current}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`current-${item.id}`}
                                            checked={item.current}
                                            onCheckedChange={(checked) => updateExperience(item.id, 'current', checked)}
                                        />
                                        <Label htmlFor={`current-${item.id}`} className="cursor-pointer">
                                            I currently work here
                                        </Label>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            placeholder="Describe your role and responsibilities..."
                                            rows={3}
                                            value={item.description || ''}
                                            onChange={(e) => updateExperience(item.id, 'description', e.target.value)}
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
