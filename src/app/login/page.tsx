import { Suspense } from "react"
import { LoginForm } from "./login-form"

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden p-6 md:p-10">
            {/* Background Decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] -z-10" />

            <div className="w-full max-w-sm relative z-10">
                <div className="absolute -top-24 left-0 right-0 flex justify-center animate-float">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-2xl shadow-primary/30">
                        <span className="text-white font-bold text-3xl">R</span>
                    </div>
                </div>
                <Suspense fallback={<div className="text-center">Loading...</div>}>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    )
}
