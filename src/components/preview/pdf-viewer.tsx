import { Card } from "@/components/ui/card"

export function PDFViewer() {
    return (
        <Card className="w-full h-full min-h-[600px] bg-white flex items-center justify-center shadow-lg">
            <div className="text-center">
                <p className="text-lg font-medium text-gray-900">PDF Preview</p>
                <p className="text-sm text-gray-500">Resume rendering will appear here</p>
            </div>
        </Card>
    )
}
