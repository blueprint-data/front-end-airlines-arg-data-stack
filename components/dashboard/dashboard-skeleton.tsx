import { Skeleton } from "@/components/ui/skeleton"
export { Skeleton }

export function ChartSkeleton() {
    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            <div className="mb-4 space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-[300px] w-full rounded-xl border border-border" />
        </div>
    )
}

export function TableSkeleton() {
    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            <div className="mb-4 space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
            </div>
            <div className="space-y-4 rounded-xl border border-border p-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        </div>
    )
}

export function KPISkeleton() {
    return (
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
        </div>
    )
}
