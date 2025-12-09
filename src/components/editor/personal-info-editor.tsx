"use client"

import { PersonalInfo } from "@/types/database"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PersonalInfoEditorProps {
    data?: PersonalInfo
    onChange: (data: PersonalInfo) => void
}

export function PersonalInfoEditor({ data = {}, onChange }: PersonalInfoEditorProps) {
    const updateField = (field: keyof PersonalInfo, value: string) => {
        onChange({
            ...data,
            [field]: value
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your basic contact information and professional summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                            id="fullName"
                            placeholder="John Doe"
                            value={data.fullName || ''}
                            onChange={(e) => updateField('fullName', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={data.email || ''}
                            onChange={(e) => updateField('email', e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            placeholder="+1 (555) 123-4567"
                            value={data.phone || ''}
                            onChange={(e) => updateField('phone', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            placeholder="San Francisco, CA"
                            value={data.location || ''}
                            onChange={(e) => updateField('location', e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                            id="website"
                            placeholder="johndoe.com"
                            value={data.website || ''}
                            onChange={(e) => updateField('website', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                            id="linkedin"
                            placeholder="linkedin.com/in/johndoe"
                            value={data.linkedin || ''}
                            onChange={(e) => updateField('linkedin', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="github">GitHub</Label>
                        <Input
                            id="github"
                            placeholder="github.com/johndoe"
                            value={data.github || ''}
                            onChange={(e) => updateField('github', e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="summary">Professional Summary</Label>
                    <Textarea
                        id="summary"
                        placeholder="A brief summary of your professional background and goals..."
                        rows={4}
                        value={data.summary || ''}
                        onChange={(e) => updateField('summary', e.target.value)}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
