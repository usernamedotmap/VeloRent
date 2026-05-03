

interface Column<T> {
    key: string;
    label: string;
    render: (row: T) => React.ReactNode;
    mobileHide?: boolean;
}

interface Props<T> {
    colums: Column<T>[];
    data: T[];
    keyField: keyof T;
    isLoading?: boolean;
    emptyText?: string;
}

function SkeletonRow({ cols }: { cols: number }) {
    return (
        <tr>
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-5 py-4">
                    <div className="h-4 bg-[hsl(var(--muted))] rounded animate-pulse" />
                </td>
            ))}
        </tr>
    );
}

export default function ResponsiveTable<T>({
    colums, data, keyField, isLoading = false, emptyText = 'No data found',
}: Props<T>) {
    const visibleCols = colums;
    const mobileCols = colums.filter((c) => !c.mobileHide);

    return (
        <>
            {/* destop table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
                        <tr>
                            {visibleCols.map((col) => (
                                <th
                                    key={col.key}
                                    className="px-5 py-3.5 text-left text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[hsl(var(--border))]">
                        {isLoading
                            ? Array.from({ length: 5 }).map((_, i) => (
                                <SkeletonRow key={i} cols={visibleCols.length} />
                            ))
                            : data.length === 0
                                ? (
                                    <tr>
                                        <td
                                            colSpan={visibleCols.length}
                                            className="px-5 py-12 text-center text-[hsl(var(--muted-foreground))] text-sm">
                                            {emptyText}
                                        </td>
                                    </tr>
                                )
                                : data.map((row) => (
                                    <tr
                                        key={String(row[keyField])}
                                        className="hover:bg-[hsl(var(--muted)/0.3)] transition-colors">
                                        {visibleCols.map((col) => (
                                            <td key={col.key}
                                                className="px-5 py-4 text-sm text-left">
                                                {col.render(row)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>

            {/* mobile table */}
            <div className="md:hidden divide-y divide-[hsl(var(--border))]">
                {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="p-4 space-y-2">
                            <div className="h-4 bg-[hsl(var(--muted))] rounded animate-pulse w-3/4" />
                            <div className="h-3 bg-[hsl(var(--muted))] rounded animate-pulse w-1/2" />
                        </div>
                    ))
                    : data.length === 0
                        ? (
                            <div className="p-8 text-center text-[hsl(var(--muted-foreground))] text-sm">
                                {emptyText}
                            </div>
                        )
                        : data.map((row) => (
                            <div key={String(row[keyField])} className="p-4 space-y-2">
                                {mobileCols.map((col) => (
                                    <div key={col.key} className="flex items-center justify-between gap-3">
                                        <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium shrink-0">
                                            {col.label}
                                        </span>
                                        <span className="text-sm text-right">
                                            {col.render(row)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ))}
            </div>
        </>
    );
}

