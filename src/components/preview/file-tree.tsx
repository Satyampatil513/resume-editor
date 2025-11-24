import { Folder, File } from "lucide-react"

interface FileNode {
    name: string
    type: 'file' | 'folder'
    children?: FileNode[]
}

interface FileTreeProps {
    files: FileNode[]
}

export function FileTree({ files }: FileTreeProps) {
    return (
        <div className="space-y-2">
            {files.map((file, index) => (
                <div key={index} className="ml-2">
                    <div className="flex items-center gap-2 text-sm hover:bg-muted/50 p-1 rounded cursor-pointer">
                        {file.type === 'folder' ? (
                            <Folder className="h-4 w-4 text-blue-500" />
                        ) : (
                            <File className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>{file.name}</span>
                    </div>
                    {file.children && (
                        <div className="ml-4 border-l pl-2">
                            <FileTree files={file.children} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
