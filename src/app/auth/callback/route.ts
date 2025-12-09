import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        try {
            const supabase = await createClient()
            const { data, error } = await supabase.auth.exchangeCodeForSession(code)

            if (!error && data.session) {
                // Successfully authenticated, redirect to dashboard
                const forwardedHost = request.headers.get('x-forwarded-host')
                const isLocalEnv = process.env.NODE_ENV === 'development'

                if (isLocalEnv) {
                    return NextResponse.redirect(`${origin}${next}`)
                } else if (forwardedHost) {
                    return NextResponse.redirect(`https://${forwardedHost}${next}`)
                } else {
                    return NextResponse.redirect(`${origin}${next}`)
                }
            }

            // Log error for debugging
            console.error('Auth callback error:', error)
            return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error?.message || 'Authentication failed')}`)
        } catch (err) {
            console.error('Auth callback exception:', err)
            return NextResponse.redirect(`${origin}/login?error=unexpected_error`)
        }
    }

    // No code provided
    return NextResponse.redirect(`${origin}/login?error=no_code`)
}
