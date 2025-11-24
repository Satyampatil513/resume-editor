import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { NewProjectDialog } from "@/components/dashboard/new-project-dialog"

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                <NewProjectDialog />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Placeholder for empty state or project list */}
                <Card className="border-dashed hover:border-primary transition-colors cursor-pointer">
                    <CardHeader>
                        <CardTitle>Create a new resume</CardTitle>
                        <CardDescription>Start from scratch or upload a zip file</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center py-6">
                        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileText className="h-10 w-10 text-primary" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Software Engineer Resume
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground mt-2">Last edited 2 hours ago</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
