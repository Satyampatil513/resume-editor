import { ResumeEditor } from "./resume-editor"

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return <ResumeEditor projectId={id} />
}
