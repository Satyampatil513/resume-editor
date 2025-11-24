// Database types
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string | null
                    full_name: string | null
                }
                Insert: {
                    id: string
                    email?: string | null
                    full_name?: string | null
                }
                Update: {
                    id?: string
                    email?: string | null
                    full_name?: string | null
                }
            }
            projects: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    created_at?: string
                }
            }
            resume_content: {
                Row: {
                    id: string
                    project_id: string
                    content: ResumeData
                    updated_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    content?: ResumeData
                    updated_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    content?: ResumeData
                    updated_at?: string
                }
            }
        }
    }
}

// Resume data structure
export interface ResumeData {
    personal?: PersonalInfo
    experience?: ExperienceItem[]
    education?: EducationItem[]
    skills?: SkillCategory[]
    projects?: ProjectItem[]
    customSections?: CustomSection[]
}

export interface PersonalInfo {
    fullName?: string
    email?: string
    phone?: string
    location?: string
    website?: string
    linkedin?: string
    github?: string
    summary?: string
}

export interface ExperienceItem {
    id: string
    company: string
    position: string
    location?: string
    startDate: string
    endDate?: string
    current?: boolean
    description?: string
    highlights?: string[]
}

export interface EducationItem {
    id: string
    institution: string
    degree: string
    field?: string
    location?: string
    startDate: string
    endDate?: string
    gpa?: string
    description?: string
}

export interface SkillCategory {
    id: string
    category: string
    skills: string[]
}

export interface ProjectItem {
    id: string
    name: string
    description?: string
    technologies?: string[]
    link?: string
    highlights?: string[]
}

export interface CustomSection {
    id: string
    title: string
    content: string
}
