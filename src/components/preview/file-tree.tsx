import { Folder, File } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FileNode {
    id: string
    name: string
    type: 'file' | 'folder'
    children?: FileNode[]
}

interface FileTreeProps {
    files: FileNode[]
    onSelect?: (node: FileNode) => void
    selectedId?: string | null
}

export function FileTree({ files, onSelect, selectedId }: FileTreeProps) {
    return (
        <div className="space-y-1">
            {files.map((file) => (
                <div key={file.id} className="ml-2">
                    <div
                        className={cn(
                            "flex items-center gap-2 text-sm p-1.5 rounded cursor-pointer transition-colors",
                            selectedId === file.id
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-muted/50 text-muted-foreground"
                        )}
                        onClick={(e) => {
                            e.stopPropagation()
                            onSelect?.(file)
                        }}
                    >
                        {file.type === 'folder' ? (
                            <Folder className={cn("h-4 w-4", selectedId === file.id ? "text-primary" : "text-blue-500")} />
                        ) : (
                            <File className="h-4 w-4" />
                        )}
                        <span>{file.name}</span>
                    </div>
                    {file.children && (
                        <div className="ml-4 border-l pl-2 mt-1">
                            <FileTree files={file.children} onSelect={onSelect} selectedId={selectedId} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
