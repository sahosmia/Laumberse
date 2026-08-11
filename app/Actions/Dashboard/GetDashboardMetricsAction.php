<?php

namespace App\Actions\Dashboard;

use App\Models\Client;
use App\Models\Expense;
use App\Models\GlobalSetting;
use App\Models\Invoice;
use App\Support\SqlDateFormat;

class GetDashboardMetricsAction
{
    public function __invoke(?string $period, ?string $from, ?string $to): array
    {
        [$period, $from, $to] = $this->resolvePeriod($period, $from, $to);

        $invoiceQuery = Invoice::query();
        if ($from) {
            $invoiceQuery->where('date', '>=', $from);
        }
        if ($to) {
            $invoiceQuery->where('date', '<=', $to);
        }

        $expenseQuery = Expense::query();
        if ($from) {
            $expenseQuery->where('date', '>=', $from);
        }
        if ($to) {
            $expenseQuery->where('date', '<=', $to);
        }

        $businessTransportCategoryId = GlobalSetting::get('business_transportation_category_id');
        $deliveryTransportCategoryId = GlobalSetting::get('delivery_transportation_category_id');

        $businessTransportExpense = (clone $expenseQuery)->where('expense_category_id', $businessTransportCategoryId)->sum('amount');
        $deliveryTransportExpense = (clone $expenseQuery)->where('expense_category_id', $deliveryTransportCategoryId)->sum('amount');

        $stats = [
            'total_orders' => (clone $invoiceQuery)->count(),
            'total_revenue' => (clone $invoiceQuery)->sum('total'),
            'total_paid' => (clone $invoiceQuery)->sum('paid'),
            'total_expense' => (clone $expenseQuery)->sum('amount'),
            'unpaid_invoices' => (clone $invoiceQuery)->where('payment_status', 'Unpaid')->count(),
            'pending' => Invoice::where('status', 'Processing')->count(),
        ];

        $transportExpense = [
            'business' => (float) $businessTransportExpense,
            'delivery' => (float) $deliveryTransportExpense,
            'total' => (float) $businessTransportExpense + (float) $deliveryTransportExpense,
        ];

        $paymentStatusSplit = [
            'paid' => Invoice::where('payment_status', 'Paid')->count(),
            'unpaid' => Invoice::where('payment_status', 'Unpaid')->count(),
        ];

        $dateFormat = SqlDateFormat::monthDay();
        $dailyRevenue = Invoice::selectRaw("$dateFormat as day, SUM(total) as revenue, SUM(paid) as paid")
            ->where('date', '>=', now()->subDays(7))
            ->groupBy('day')
            ->orderBy('date')
            ->get();

        return [
            'stats' => $stats,
            'transportExpense' => $transportExpense,
            'paymentStatusSplit' => $paymentStatusSplit,
            'top_clients' => Client::orderBy('total_paid', 'desc')->take(5)->get(),
            'dailyRevenue' => $dailyRevenue,
            'filters' => [
                'period' => $period,
                'from' => $from,
                'to' => $to,
            ],
        ];
    }

    /**
     * Resolves a named period (today/this_month/last_month/this_year/custom) into a concrete
     * [period, from, to] date range. Defaults to 'this_month' when nothing is specified, and to
     * 'custom' when a from/to was given without naming a period explicitly.
     */
    private function resolvePeriod(?string $period, ?string $from, ?string $to): array
    {
        $period = $period ?: (($from || $to) ? 'custom' : 'this_month');

        [$resolvedFrom, $resolvedTo] = match ($period) {
            'today' => [now()->toDateString(), now()->toDateString()],
            'this_month' => [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()],
            'last_month' => [now()->subMonthNoOverflow()->startOfMonth()->toDateString(), now()->subMonthNoOverflow()->endOfMonth()->toDateString()],
            'this_year' => [now()->startOfYear()->toDateString(), now()->endOfYear()->toDateString()],
            default => [$from, $to],
        };

        return [$period, $resolvedFrom, $resolvedTo];
    }
}
