'use server'

import { createClient } from '@/utils/supabase/server'

export async function incrementVisit(path: string) {
    const supabase = await createClient()

    // We use the RPC function we just created
    const { error } = await supabase.rpc('increment_page_visit', {
        page_path: path
    })

    if (error) {
        console.error('Error incrementing visit:', error)
    }
}

export async function getVisits() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('page_visits')
        .select('*')
        .order('visit_count', { ascending: false })

    if (error) {
        console.error('Error fetching visits:', error)
        return []
    }

    return data
}
