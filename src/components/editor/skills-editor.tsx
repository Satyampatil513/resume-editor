"use client"

import { useState } from "react"
import { SkillCategory } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SkillsEditorProps {
    data: SkillCategory[]
    onChange: (data: SkillCategory[]) => void
}

export function SkillsEditor({ data, onChange }: SkillsEditorProps) {
    const [newSkillInputs, setNewSkillInputs] = useState<Record<string, string>>({})

    const addCategory = () => {
        const newCategory: SkillCategory = {
            id: crypto.randomUUID(),
            category: '',
            skills: []
        }
        onChange([...data, newCategory])
    }

    const updateCategory = (id: string, category: string) => {
        onChange(data.map(item =>
            item.id === id ? { ...item, category } : item
        ))
    }

    const deleteCategory = (id: string) => {
        onChange(data.filter(item => item.id !== id))
    }

    const addSkill = (categoryId: string) => {
        const skillName = newSkillInputs[categoryId]?.trim()
        if (!skillName) return

        onChange(data.map(item =>
            item.id === categoryId
                ? { ...item, skills: [...item.skills, skillName] }
                : item
        ))
        setNewSkillInputs({ ...newSkillInputs, [categoryId]: '' })
    }

    const removeSkill = (categoryId: string, skillIndex: number) => {
        onChange(data.map(item =>
            item.id === categoryId
                ? { ...item, skills: item.skills.filter((_, i) => i !== skillIndex) }
                : item
        ))
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Skills</h3>
                    <p className="text-sm text-muted-foreground">Organize your skills by category</p>
                </div>
                <Button onClick={addCategory} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                </Button>
            </div>

            {data.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-sm text-muted-foreground mb-4">No skills added yet</p>
                        <Button onClick={addCategory} variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Skill Category
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {data.map((category) => (
                        <Card key={category.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between gap-4">
                                    <Input
                                        placeholder="Category (e.g., Programming Languages)"
                                        value={category.category}
                                        onChange={(e) => updateCategory(category.id, e.target.value)}
                                        className="text-base font-semibold border-none shadow-none px-0 focus-visible:ring-0"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteCategory(category.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    {category.skills.map((skill, index) => (
                                        <Badge key={index} variant="secondary" className="gap-1 pr-1">
                                            {skill}
                                            <button
                                                onClick={() => removeSkill(category.id, index)}
                                                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a skill..."
                                        value={newSkillInputs[category.id] || ''}
                                        onChange={(e) => setNewSkillInputs({
                                            ...newSkillInputs,
                                            [category.id]: e.target.value
                                        })}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                addSkill(category.id)
                                            }
                                        }}
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() => addSkill(category.id)}
                                        disabled={!newSkillInputs[category.id]?.trim()}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
