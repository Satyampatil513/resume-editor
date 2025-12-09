import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, X, Paperclip } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ComponentItem } from "@/components/editor/component-list"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    created_at?: string
}

interface AIChatProps {
    projectId: string
    selectedSection?: string | null
    components?: ComponentItem[]
    currentCode?: string
    onCodeUpdate?: (code: string) => void
}

export function AIChat({ projectId, selectedSection, components = [], currentCode, onCodeUpdate }: AIChatProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoadingHistory, setIsLoadingHistory] = useState(true)
    const [input, setInput] = useState("")
    const [mentionQuery, setMentionQuery] = useState<string | null>(null)
    const [showMentionMenu, setShowMentionMenu] = useState(false)
    const [attachedComponents, setAttachedComponents] = useState<ComponentItem[]>([])
    const inputRef = useRef<HTMLInputElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    const [versions, setVersions] = useState<any[]>([])
    const [isReverting, setIsReverting] = useState(false)

    // Load chat history & versions
    useEffect(() => {
        const loadHistory = async () => {
            if (!projectId) return
            setIsLoadingHistory(true)
            try {
                const supabase = createClient()

                try {
                    // Fetch messages
                    const { data: messagesData, error: messagesError } = await supabase
                        .from('chat_messages')
                        .select('*')
                        .eq('project_id', projectId)
                        .order('created_at', { ascending: true })

                    if (messagesError) throw messagesError
                    if (messagesData && messagesData.length > 0) {
                        setMessages(messagesData as any)
                    } else if (currentCode) {
                        // Project Loaded but no history. Create Initial Version.
                        // We need to persist this so "Revert" is possible from start.
                        // Avoid double-create issues by checking if we just did it or using a flag?
                        // For now, let's just create it. The backend ID will be unique.
                        const welcomeId = crypto.randomUUID()

                        // Insert Welcome Message
                        const { error: msgErr } = await supabase.from('chat_messages').insert({
                            id: welcomeId,
                            project_id: projectId,
                            role: 'assistant',
                            content: 'Hello! I can help you edit your resume. You can mention specific sections using "@" to give me their context.'
                        })

                        if (!msgErr) {
                            // Insert Baseline Version
                            const { data: vData } = await supabase.from('resume_versions').insert({
                                project_id: projectId,
                                chat_message_id: welcomeId,
                                patch_content: { type: 'init', note: 'Original State' },
                                full_code: currentCode
                            }).select().single()

                            if (vData) {
                                setVersions([vData])
                            }

                            setMessages([{
                                id: welcomeId,
                                role: 'assistant',
                                content: 'Hello! I can help you edit your resume. You can mention specific sections using "@" to give me their context.'
                            }])
                        } else {
                            // Fallback to local state if insert fails
                            setMessages([{
                                id: 'welcome',
                                role: 'assistant',
                                content: 'Hello! I can help you edit your resume. You can mention specific sections using "@" to give me their context.'
                            }])
                        }
                    } else {
                        // No code yet (maybe loading), just show welcome
                        setMessages([{
                            id: 'welcome',
                            role: 'assistant',
                            content: 'Hello! I can help you edit your resume. You can mention specific sections using "@" to give me their context.'
                        }])
                    }
                } catch (msgError) {
                    console.error("Failed to load chat messages:", msgError)
                }

                try {
                    // Fetch versions
                    const { data: versionsData, error: versionsError } = await supabase
                        .from('resume_versions')
                        .select('id, chat_message_id, full_code, created_at')
                        .eq('project_id', projectId)

                    if (versionsError) throw versionsError
                    setVersions(versionsData || [])
                } catch (verError) {
                    console.error("Failed to load resume versions:", verError)
                }
            } catch (error) {
                console.error("Unexpected error in loadHistory:", error)
            } finally {
                setIsLoadingHistory(false)
            }
        }
        loadHistory()
    }, [projectId, currentCode])

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleRevert = async (version: any) => {
        if (!confirm("Are you sure you want to revert your resume to this state? This will overwrite your current changes.")) return

        setIsReverting(true)
        try {
            if (onCodeUpdate) {
                // Update Parent
                onCodeUpdate(version.full_code)

                // Add a local message indicating revert
                const revertMsg = {
                    id: Date.now().toString(),
                    role: 'assistant' as const,
                    content: `Reverted resume to version from ${new Date(version.created_at).toLocaleString()}`
                }
                setMessages(prev => [...prev, revertMsg])

                // TODO: Save this "Revert" action as a new message to DB? 
                // For now, let's keep it simple.
            }
        } catch (error) {
            console.error("Revert failed:", error)
        } finally {
            setIsReverting(false)
        }
    }

    // Filter components based on mention query
    const filteredComponents = mentionQuery
        ? components.filter(c => c.name.toLowerCase().includes(mentionQuery.toLowerCase()))
        : components

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setInput(value)

        // Check for mention trigger
        const lastAt = value.lastIndexOf('@')
        if (lastAt !== -1 && (lastAt === 0 || value[lastAt - 1] === ' ')) {
            const query = value.slice(lastAt + 1)
            // Only show menu if query doesn't contain spaces (simple heuristic)
            if (!query.includes(' ')) {
                setMentionQuery(query)
                setShowMentionMenu(true)
                return
            }
        }

        setShowMentionMenu(false)
        setMentionQuery(null)
    }

    const handleSelectComponent = (component: ComponentItem) => {
        if (attachedComponents.find(c => c.id === component.id)) {
            setShowMentionMenu(false)
            setMentionQuery(null)
            return
        }

        setAttachedComponents([...attachedComponents, component])

        // Remove the mention query from input
        const lastAt = input.lastIndexOf('@')
        if (lastAt !== -1) {
            setInput(input.slice(0, lastAt))
        }

        setShowMentionMenu(false)
        setMentionQuery(null)
        inputRef.current?.focus()
    }

    const removeAttachment = (id: string) => {
        setAttachedComponents(attachedComponents.filter(c => c.id !== id))
    }

    const sendMessage = async () => {
        if (!input.trim() && attachedComponents.length === 0) return

        // Construct message with context
        let fullContent = input
        if (attachedComponents.length > 0) {
            const context = attachedComponents.map(c =>
                `\n[Context: ${c.name}]\n\`\`\`latex\n${c.content || ''}\n\`\`\``
            ).join('\n')
            fullContent += `\n\nAttached Context:${context}`
        }

        // Optimistic Update
        const tempId = Date.now().toString()
        const newMessage: Message = {
            id: tempId,
            role: 'user',
            content: fullContent
        }

        setMessages(prev => [...prev, newMessage])
        setInput("")

        // Capture current attachments before clearing
        const currentAttachments = [...attachedComponents]
        setAttachedComponents([])

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId, // Pass projectId for saving
                    messages: [...messages, newMessage],
                    currentCode: currentCode,
                    systemPrompt: "You are an expert LaTeX resume editor. Help the user edit their resume. When they provide context, use it to give specific advice or code snippets."
                })
            })

            if (!response.ok) throw new Error('Failed to send message')

            const data = await response.json()

            // In production, we'd replace the temp message with the real one from DB (response should return it)
            // For now, we assume the backend saved it and we just display the AI response.

            if (data.type === 'update_code') {
                if (onCodeUpdate) {
                    onCodeUpdate(data.content)

                    // Re-fetch versions to get the new one?
                    // Or optimistically add it? 
                    // Let's re-fetch silently
                    // Add new version to state
                    if (data.version) {
                        console.log("Adding new version to history:", data.version)
                        setVersions(prev => [...prev, data.version])
                    } else {
                        console.warn("Update code response missing 'version' object:", data)
                    }

                    setMessages(prev => [...prev, {
                        id: data.message_id || (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: `I've updated your resume code. ${data.explanation || ''}`
                    }])
                } else {
                    setMessages(prev => [...prev, {
                        id: (Date.now() + 1).toString(), // No message ID available if not saved?
                        role: 'assistant',
                        content: `I wanted to update the code, but I don't have permission. Here is what I changed: ${data.explanation}`
                    }])
                }
            } else {
                // Normal message
                const contextMsg = currentAttachments.length > 0
                    ? `\n\n(Context used: ${currentAttachments.map(c => c.name).join(', ')})`
                    : ""

                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: (data.content || "I didn't understand that.") + contextMsg
                }])
            }

        } catch (error) {
            console.error('Chat error:', error)
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Sorry, I encountered an error processing your request. Please try again."
            }])
        }
    }

    return (
        <div className="flex flex-col h-full min-h-0 bg-background border-r relative" style={{ height: '100%' }}>
            <div className="p-4 border-b shrink-0">
                <h3 className="font-semibold flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    AI Assistant
                </h3>
                <p className="text-xs text-muted-foreground">Type @ to attach sections</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin" ref={scrollRef}>
                {messages.map((message) => {
                    const version = versions.find(v => v.chat_message_id === message.id)
                    return (
                        <div
                            key={message.id}
                            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <Avatar className="h-8 w-8">
                                {message.role === 'assistant' ? (
                                    <>
                                        <AvatarImage src="/bot-avatar.png" />
                                        <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                                    </>
                                ) : (
                                    <>
                                        <AvatarImage src="/user-avatar.png" />
                                        <AvatarFallback>ME</AvatarFallback>
                                    </>
                                )}
                            </Avatar>
                            <div
                                className={`rounded-lg p-3 text-sm max-w-[80%] whitespace-pre-wrap ${message.role === 'user'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                                    }`}
                            >
                                {message.content.split('\n\nAttached Context:')[0]}

                                {message.content.includes('\n\nAttached Context:') && (
                                    <details className="mt-2 text-xs opacity-90 border-t pt-2 border-white/20">
                                        <summary className="cursor-pointer hover:underline font-medium">
                                            View Attached Context ({message.content.split('Context: ').length - 1} sections)
                                        </summary>
                                        <div className="mt-2 p-2 bg-black/20 rounded font-mono text-[10px] overflow-x-auto">
                                            {message.content.split('\n\nAttached Context:')[1]}
                                        </div>
                                    </details>
                                )}

                                {version && (
                                    <div className="mt-2 pt-2 border-t border-border/50">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-6 text-xs w-full gap-1"
                                            onClick={() => handleRevert(version)}
                                            disabled={isReverting}
                                        >
                                            <Bot className="h-3 w-3" />
                                            Revert to this Version
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Mention Menu */}
            {
                showMentionMenu && filteredComponents.length > 0 && (
                    <div className="absolute bottom-[80px] left-4 right-4 bg-popover border rounded-md shadow-lg overflow-hidden z-10 max-h-[200px] overflow-y-auto animate-in slide-in-from-bottom-2">
                        <div className="p-2 text-xs font-medium text-muted-foreground bg-muted/50">
                            Suggested Sections
                        </div>
                        {filteredComponents.map(component => (
                            <button
                                key={component.id}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition-colors"
                                onClick={() => handleSelectComponent(component)}
                            >
                                {component.icon}
                                <span>{component.name}</span>
                            </button>
                        ))}
                    </div>
                )
            }

            <div className="p-4 border-t mt-auto bg-background shrink-0">
                {/* Attached Chips */}
                {attachedComponents.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {attachedComponents.map(c => (
                            <div key={c.id} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full border border-primary/20 animate-in fade-in zoom-in-95">
                                <span className="w-3 h-3">{c.icon}</span>
                                <span>{c.name}</span>
                                <button
                                    onClick={() => removeAttachment(c.id)}
                                    className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        sendMessage()
                    }}
                    className="flex gap-2"
                >
                    <div className="relative flex-1">
                        <Input
                            ref={inputRef}
                            placeholder="Type a message... (Use @ to attach)"
                            value={input}
                            onChange={handleInputChange}
                            className="pr-8"
                        />
                        {/* Optional: Add a manual attach button inside input */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                                setInput(input + '@')
                                setMentionQuery('')
                                setShowMentionMenu(true)
                                inputRef.current?.focus()
                            }}
                        >
                            <Paperclip className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button type="submit" size="icon">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div >
    )
}
