<?php

namespace App\Actions\Dashboard;

use App\Enums\InvoiceStatus;
use App\Enums\PaymentStatus;
use App\Models\Account;
use App\Models\Client;
use App\Models\ClientActivity;
use App\Models\Expense;
use App\Models\GlobalSetting;
use App\Models\Invoice;
use App\Support\OutletContext;
use App\Support\PeriodResolver;
use App\Support\SqlDateFormat;

class GetDashboardMetricsAction
{
    /** How many rows each of the upcoming/missed meeting widgets shows before "view all". */
    private const MEETINGS_LIMIT = 5;

    public function __invoke(?string $period, ?string $from, ?string $to): array
    {
        [$period, $from, $to] = PeriodResolver::resolve($period, $from, $to);

        $invoiceQuery = Invoice::query()->tap(fn ($q) => OutletContext::scope($q));
        if ($from) {
            $invoiceQuery->where('date', '>=', $from);
        }
        if ($to) {
            $invoiceQuery->where('date', '<=', $to);
        }

        $expenseQuery = Expense::query()->tap(fn ($q) => OutletContext::scope($q));
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
            'unpaid_invoices' => (clone $invoiceQuery)->where('payment_status', PaymentStatus::Unpaid->value)->count(),
            'pending' => Invoice::tap(fn ($q) => OutletContext::scope($q))->where('status', InvoiceStatus::Processing->value)->count(),
        ];

        $transportExpense = [
            'business' => (float) $businessTransportExpense,
            'delivery' => (float) $deliveryTransportExpense,
            'total' => (float) $businessTransportExpense + (float) $deliveryTransportExpense,
        ];

        $paymentStatusSplit = [
            'paid' => Invoice::tap(fn ($q) => OutletContext::scope($q))->where('payment_status', PaymentStatus::Paid->value)->count(),
            'unpaid' => Invoice::tap(fn ($q) => OutletContext::scope($q))->where('payment_status', PaymentStatus::Unpaid->value)->count(),
        ];

        $dateFormat = SqlDateFormat::monthDay();
        $dailyRevenue = Invoice::selectRaw("$dateFormat as day, SUM(total) as revenue, SUM(paid) as paid")
            ->tap(fn ($q) => OutletContext::scope($q))
            ->where('date', '>=', now()->subDays(7))
            ->groupBy('day')
            ->orderByRaw('MIN(date) asc')
            ->get();

        // Live cash position — not period-filtered, current_balance is a running total, not
        // something that happened "within" a date range like invoices/expenses are.
        $accounts = Account::tap(fn ($q) => OutletContext::scope($q))
            ->orderBy('current_balance', 'desc')
            ->get(['id', 'name', 'account_number', 'current_balance']);

        // Live, like $accounts above — not filtered by the dashboard's own period filter. Ordered
        // oldest-scheduled_at-first, so an overdue (missed) one surfaces before a further-out
        // upcoming one — the frontend flags anything before "now" with a "Missed" badge.
        $pendingActivitiesOfType = fn (string $type) => ClientActivity::with(['client:id,name', 'employee:id,name'])
            ->tap(fn ($q) => OutletContext::scope($q))
            ->where('status', 'pending')
            ->where('type', $type);

        $meetings = (clone $pendingActivitiesOfType('meeting'))->orderBy('scheduled_at')->take(self::MEETINGS_LIMIT)->get();
        $followUps = (clone $pendingActivitiesOfType('follow_up'))->orderBy('scheduled_at')->take(self::MEETINGS_LIMIT)->get();

        return [
            'stats' => $stats,
            'transportExpense' => $transportExpense,
            'paymentStatusSplit' => $paymentStatusSplit,
            'top_clients' => Client::orderBy('total_paid', 'desc')->take(5)->get(),
            'dailyRevenue' => $dailyRevenue,
            'accounts' => [
                'items' => $accounts,
                'total' => (float) $accounts->sum('current_balance'),
            ],
            'meetings' => [
                'items' => $meetings,
                'total' => $pendingActivitiesOfType('meeting')->count(),
            ],
            'followUps' => [
                'items' => $followUps,
                'total' => $pendingActivitiesOfType('follow_up')->count(),
            ],
            'filters' => [
                'period' => $period,
                'from' => $from,
                'to' => $to,
            ],
        ];
    }
}
