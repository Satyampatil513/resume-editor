import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Plus } from "lucide-react"

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Project
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Placeholder for empty state or project list */}
                <Card className="border-dashed">
                    <CardHeader>
                        <CardTitle>Create a new resume</CardTitle>
                        <CardDescription>Start from scratch or upload a zip file</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center py-6">
                        <Button variant="outline" className="h-20 w-20 rounded-full">
                            <Plus className="h-8 w-8" />
                        </Button>
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
