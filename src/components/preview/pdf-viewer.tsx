import { Card } from "@/components/ui/card"

interface PDFViewerProps {
    pdfUrl?: string | null
    isLoading?: boolean
}

export function PDFViewer({ pdfUrl, isLoading }: PDFViewerProps) {
    return (
        <Card className="w-full h-full bg-white flex items-center justify-center overflow-hidden relative border-0 rounded-none">
            {isLoading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}

            {pdfUrl ? (
                <iframe
                    src={pdfUrl}
                    className="w-full h-full border-none"
                    title="Resume Preview"
                />
            ) : (
                <div className="text-center p-6">
                    <p className="text-lg font-medium text-gray-900">PDF Preview</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Click "Refresh Preview" to compile and view.
                    </p>
                </div>
            )}
        </Card>
    )
}
