import { Skeleton } from './skeleton';

/** Ghost `<tr>` rows for a table body while a search/filter/pagination request is in flight — drop straight into `<tbody>` in place of the real rows. */
export function TableSkeletonRows({ columns, rows = 6 }: { columns: number; rows?: number }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b border-neutral-50 dark:border-neutral-800">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <td key={colIndex} className="px-5 py-4">
                            <Skeleton className="h-4 w-full" />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}
