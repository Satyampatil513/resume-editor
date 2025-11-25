import { Layers, User, Briefcase, GraduationCap, Code, FolderGit2, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ComponentItem {
    id: string
    name: string
    icon: React.ReactNode
}

const COMPONENTS: ComponentItem[] = [
    { id: 'personal', name: 'Personal Info', icon: <User className="h-4 w-4" /> },
    { id: 'experience', name: 'Experience', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'education', name: 'Education', icon: <GraduationCap className="h-4 w-4" /> },
    { id: 'skills', name: 'Skills', icon: <Code className="h-4 w-4" /> },
    { id: 'projects', name: 'Projects', icon: <FolderGit2 className="h-4 w-4" /> },
    { id: 'achievements', name: 'Achievements', icon: <Trophy className="h-4 w-4" /> },
]

interface ComponentListProps {
    onSelect?: (id: string) => void
    selectedId?: string | null
    items?: ComponentItem[]
}

export function ComponentList({ onSelect, selectedId, items }: ComponentListProps) {
    const displayItems = items && items.length > 0 ? items : COMPONENTS

    return (
        <div className="space-y-1">
            {displayItems.map((component) => (
                <div
                    key={component.id}
                    className={cn(
                        "flex items-center gap-2 text-sm p-2 rounded cursor-pointer transition-colors ml-2",
                        selectedId === component.id
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-muted/50 text-muted-foreground"
                    )}
                    onClick={() => onSelect?.(component.id)}
                >
                    {component.icon}
                    <span>{component.name}</span>
                </div>
            ))}
        </div>
    )
}
