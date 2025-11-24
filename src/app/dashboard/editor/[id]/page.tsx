import { ResumeEditor } from "./resume-editor"

export default function EditorPage({ params }: { params: { id: string } }) {
    return <ResumeEditor projectId={params.id} />
}
