<?php

namespace App\Actions\Reports;

use App\Models\Category;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Support\SqlDateFormat;

class GetReportSummaryAction
{
    private const CATEGORY_COLORS = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'];

    public function __invoke(): array
    {
        // Monthly Revenue, Paid, Cost (calculated as 40% of revenue for demo)
        $monthlyStats = Invoice::selectRaw(
            SqlDateFormat::monthLabel().' as month,
                SUM(total) as revenue,
                SUM(paid) as paid,
                SUM(total) * 0.4 as cost'
        )
            ->groupBy('month')
            ->orderByRaw('MIN(date) asc')
            ->get();

        $categorySplit = Category::with(['products.invoiceItems' => function ($query) {
            $query->select('product_id', 'qty', 'price');
        }])->get()->map(function ($category, $index) {
            $value = $category->products->flatMap->invoiceItems->sum(function ($item) {
                return $item->qty * $item->price;
            });

            return [
                'name' => $category->name,
                'value' => (float) $value,
                'fill' => self::CATEGORY_COLORS[$index % count(self::CATEGORY_COLORS)],
            ];
        })->values();

        return [
            'monthlyData' => $monthlyStats,
            'categorySplit' => $categorySplit,
            'totalServices' => InvoiceItem::sum('qty'),
        ];
    }
}
