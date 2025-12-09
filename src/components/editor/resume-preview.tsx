"use client"

import { ResumeData } from "@/types/database"
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react"

interface ResumePreviewProps {
    data: ResumeData
}

export function ResumePreview({ data }: ResumePreviewProps) {
    const { personal, experience, education, skills } = data

    return (
        <div className="p-12 space-y-6 text-sm">
            {/* Header */}
            {personal && (
                <div className="space-y-3 border-b-2 border-gray-800 dark:border-gray-200 pb-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {personal.fullName || 'Your Name'}
                    </h1>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-600 dark:text-gray-400 text-xs">
                        {personal.email && (
                            <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span>{personal.email}</span>
                            </div>
                        )}
                        {personal.phone && (
                            <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{personal.phone}</span>
                            </div>
                        )}
                        {personal.location && (
                            <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{personal.location}</span>
                            </div>
                        )}
                        {personal.website && (
                            <div className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                <span>{personal.website}</span>
                            </div>
                        )}
                        {personal.linkedin && (
                            <div className="flex items-center gap-1">
                                <Linkedin className="h-3 w-3" />
                                <span>{personal.linkedin}</span>
                            </div>
                        )}
                        {personal.github && (
                            <div className="flex items-center gap-1">
                                <Github className="h-3 w-3" />
                                <span>{personal.github}</span>
                            </div>
                        )}
                    </div>

                    {personal.summary && (
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {personal.summary}
                        </p>
                    )}
                </div>
            )}

            {/* Experience */}
            {experience && experience.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide border-b border-gray-300 dark:border-gray-700 pb-1">
                        Experience
                    </h2>
                    <div className="space-y-4">
                        {experience.map((exp) => (
                            <div key={exp.id} className="space-y-1">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                        {exp.position}
                                    </h3>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                    </span>
                                </div>
                                <div className="text-gray-700 dark:text-gray-300">
                                    {exp.company}{exp.location && `, ${exp.location}`}
                                </div>
                                {exp.description && (
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {exp.description}
                                    </p>
                                )}
                                {exp.highlights && exp.highlights.length > 0 && (
                                    <ul className="list-disc list-inside space-y-0.5 text-gray-600 dark:text-gray-400">
                                        {exp.highlights.map((highlight, i) => (
                                            <li key={i}>{highlight}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education */}
            {education && education.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide border-b border-gray-300 dark:border-gray-700 pb-1">
                        Education
                    </h2>
                    <div className="space-y-3">
                        {education.map((edu) => (
                            <div key={edu.id} className="space-y-1">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                        {edu.degree}{edu.field && ` in ${edu.field}`}
                                    </h3>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                        {edu.startDate} - {edu.endDate}
                                    </span>
                                </div>
                                <div className="text-gray-700 dark:text-gray-300">
                                    {edu.institution}{edu.location && `, ${edu.location}`}
                                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                                </div>
                                {edu.description && (
                                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                                        {edu.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skills */}
            {skills && skills.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide border-b border-gray-300 dark:border-gray-700 pb-1">
                        Skills
                    </h2>
                    <div className="space-y-2">
                        {skills.map((category) => (
                            <div key={category.id} className="flex gap-2">
                                <span className="font-semibold text-gray-900 dark:text-gray-100 min-w-[120px]">
                                    {category.category}:
                                </span>
                                <span className="text-gray-700 dark:text-gray-300">
                                    {category.skills.join(', ')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!personal && !experience?.length && !education?.length && !skills?.length && (
                <div className="flex items-center justify-center h-[600px] text-muted-foreground">
                    <div className="text-center space-y-2">
                        <p className="text-lg font-medium">Your resume preview will appear here</p>
                        <p className="text-sm">Start filling in your information to see it come to life</p>
                    </div>
                </div>
            )}
        </div>
    )
}
