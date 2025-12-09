'use client'

import { useEffect } from 'react'
import { incrementVisit } from '@/actions/analytics'

export function VisitTracker() {
    useEffect(() => {
        // We increment visit for the current path
        incrementVisit(window.location.pathname)
    }, [])

    return null
}
