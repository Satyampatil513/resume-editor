"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
}

interface AIChatProps {
    selectedSection?: string | null
}

export function AIChat({ selectedSection }: AIChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I can help you edit your resume. Select a section from the file tree to get started.'
        }
    ])
    const [input, setInput] = useState("")

    const sendMessage = () => {
        if (!input.trim()) return

        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input
        }

        setMessages([...messages, newMessage])
        setInput("")

        // Simulate AI response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm processing your request. (This is a demo response)"
            }])
        }, 1000)
    }

    return (
        <div className="flex flex-col h-full bg-background border-r">
            <div className="p-4 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    AI Assistant
                </h3>
                <p className="text-xs text-muted-foreground">Ask me to update your resume</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                            className={`rounded-lg p-3 text-sm max-w-[80%] ${message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                                }`}
                        >
                            {message.content}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t mt-auto">
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        sendMessage()
                    }}
                    className="flex gap-2"
                >
                    <Input
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit" size="icon">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    )
}
