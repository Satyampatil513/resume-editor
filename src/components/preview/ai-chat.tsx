import { Card } from "@/components/ui/card"

export function AIChat() {
    return (
        <div className="h-full flex flex-col p-4">
            <div className="mb-4">
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-sm text-muted-foreground">Chat with AI to edit your resume</p>
            </div>
            <Card className="flex-1 flex items-center justify-center bg-muted/50 border-dashed">
                <p className="text-muted-foreground text-sm">AI Chat Coming Soon</p>
            </Card>
        </div>
    )
}
