import { LoginForm } from "./login-form"

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800 p-6 md:p-10">
            <div className="w-full max-w-sm relative">
                <div className="absolute -top-20 left-0 right-0 flex justify-center">
                    <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg mb-8">
                        <span className="text-primary-foreground font-bold text-xl">R</span>
                    </div>
                </div>
                <LoginForm />
            </div>
        </div>
    )
}
