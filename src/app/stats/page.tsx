import { getVisits } from "@/actions/analytics"

export const dynamic = 'force-dynamic'

export default async function StatsPage() {
    const visits = await getVisits()

    const totalVisits = visits.reduce((acc, curr) => acc + (curr.visit_count || 0), 0)

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Internal Analytics</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <div className="p-6 bg-card rounded-lg border shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Visits</h3>
                    <div className="text-4xl font-bold mt-2">{totalVisits}</div>
                </div>
            </div>

            <div className="rounded-md border">
                <div className="p-4 bg-muted/50 font-medium grid grid-cols-3 gap-4">
                    <div>Path</div>
                    <div className="text-right">Visits</div>
                    <div className="text-right">Last Visited</div>
                </div>
                <div className="divide-y">
                    {visits.map((visit) => (
                        <div key={visit.id} className="p-4 grid grid-cols-3 gap-4 items-center">
                            <div className="font-mono text-sm">{visit.path}</div>
                            <div className="text-right font-medium">{visit.visit_count}</div>
                            <div className="text-right text-sm text-muted-foreground">
                                {new Date(visit.last_visited_at).toLocaleString()}
                            </div>
                        </div>
                    ))}
                    {visits.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            No visits recorded yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
