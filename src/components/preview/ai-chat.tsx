import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, X, Paperclip } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ComponentItem } from "@/components/editor/component-list"
import { cn } from "@/lib/utils"

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
}

interface AIChatProps {
    selectedSection?: string | null
    components?: ComponentItem[]
    currentCode?: string
    onCodeUpdate?: (code: string) => void
}

export function AIChat({ selectedSection, components = [], currentCode, onCodeUpdate }: AIChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I can help you edit your resume. You can mention specific sections using "@" to give me their context.'
        }
    ])
    const [input, setInput] = useState("")
    const [mentionQuery, setMentionQuery] = useState<string | null>(null)
    const [showMentionMenu, setShowMentionMenu] = useState(false)
    const [attachedComponents, setAttachedComponents] = useState<ComponentItem[]>([])
    const inputRef = useRef<HTMLInputElement>(null)

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

        const newMessage: Message = {
            id: Date.now().toString(),
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
                    messages: [...messages, newMessage],
                    currentCode: currentCode, // Pass current code for context
                    systemPrompt: "You are an expert LaTeX resume editor. Help the user edit their resume. When they provide context, use it to give specific advice or code snippets."
                })
            })

            if (!response.ok) throw new Error('Failed to send message')

            const data = await response.json()

            if (data.type === 'update_code') {
                // Handle code update
                if (onCodeUpdate) {
                    onCodeUpdate(data.content)
                    setMessages(prev => [...prev, {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: `I've updated your resume code. ${data.explanation || ''}`
                    }])
                } else {
                    setMessages(prev => [...prev, {
                        id: (Date.now() + 1).toString(),
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
        <div className="flex flex-col h-full bg-background border-r relative">
            <div className="p-4 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    AI Assistant
                </h3>
                <p className="text-xs text-muted-foreground">Type @ to attach sections</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {messages.map((message) => (
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
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
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
                        </div>
                    </div>
                ))}
            </div>

            {/* Mention Menu */}
            {showMentionMenu && filteredComponents.length > 0 && (
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
            )}

            <div className="p-4 border-t mt-auto bg-background">
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
        </div>
    )
}
