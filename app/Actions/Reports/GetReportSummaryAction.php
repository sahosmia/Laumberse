<?php

namespace App\Actions\Reports;

use App\Models\Category;
use App\Models\Expense;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Support\OutletContext;
use App\Support\PeriodResolver;
use App\Support\SqlDateFormat;

class GetReportSummaryAction
{
    private const CATEGORY_COLORS = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'];

    public function __invoke(?string $period, ?string $from, ?string $to): array
    {
        [$period, $from, $to] = PeriodResolver::resolve($period, $from, $to);

        $invoiceQuery = Invoice::query()->tap(fn ($q) => OutletContext::scope($q));
        $expenseQuery = Expense::query()->tap(fn ($q) => OutletContext::scope($q));
        if ($from) {
            $invoiceQuery->where('date', '>=', $from);
            $expenseQuery->where('date', '>=', $from);
        }
        if ($to) {
            $invoiceQuery->where('date', '<=', $to);
            $expenseQuery->where('date', '<=', $to);
        }

        // Cost is each month's real recorded expense total, not a synthetic percentage of revenue.
        // Only months with at least one invoice are shown (the chart's x-axis is invoice-driven),
        // but each one's cost is that same month's real expenses — 0 if none, not an estimate.
        $monthlyCost = (clone $expenseQuery)
            ->selectRaw(SqlDateFormat::monthLabel().' as month, SUM(amount) as cost')
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        $monthlyData = (clone $invoiceQuery)
            ->selectRaw(SqlDateFormat::monthLabel().' as month, SUM(total) as revenue, SUM(paid) as paid')
            ->groupBy('month')
            ->orderByRaw('MIN(date) asc')
            ->get()
            ->map(fn ($row) => [
                'month' => $row->month,
                'revenue' => (float) $row->revenue,
                'paid' => (float) $row->paid,
                'cost' => (float) ($monthlyCost[$row->month]->cost ?? 0),
            ]);

        $categorySplit = Category::with(['products.invoiceItems' => function ($query) use ($from, $to) {
            $query->select('invoice_items.id', 'invoice_items.product_id', 'invoice_items.qty', 'invoice_items.price', 'invoice_items.invoice_id')
                ->whereHas('invoice', function ($q) use ($from, $to) {
                    OutletContext::scope($q);
                    $q->when($from, fn ($q) => $q->where('date', '>=', $from));
                    $q->when($to, fn ($q) => $q->where('date', '<=', $to));
                });
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

        $totalServices = InvoiceItem::whereHas('invoice', function ($q) use ($from, $to) {
            OutletContext::scope($q);
            $q->when($from, fn ($q) => $q->where('date', '>=', $from));
            $q->when($to, fn ($q) => $q->where('date', '<=', $to));
        })->sum('qty');

        return [
            'monthlyData' => $monthlyData->values(),
            'categorySplit' => $categorySplit,
            'totalServices' => $totalServices,
            'filters' => [
                'period' => $period,
                'from' => $from,
                'to' => $to,
            ],
        ];
    }
}
