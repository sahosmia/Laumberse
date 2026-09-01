<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Asset;
use App\Models\Client;
use App\Models\ClientActivity;
use App\Models\Employee;
use App\Models\Expense;
use App\Models\Invoice;
use App\Models\Note;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\User;
use App\Support\OutletContext;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $query = trim((string) $request->get('q', ''));

        if (mb_strlen($query) < 2) {
            return response()->json($this->emptyResults());
        }

        $user = $request->user();

        return response()->json([
            'clients' => $user->can('clients.view') ? $this->searchClients($query) : [],
            'invoices' => $user->can('invoices.view') ? $this->searchInvoices($query) : [],
            'products' => $user->can('catalog.view') ? $this->searchProducts($query) : [],
            'notes' => $user->can('notes.view') ? $this->searchNotes($query) : [],
            'employees' => $user->can('employees.view') ? $this->searchEmployees($query) : [],
            'expenses' => $user->can('expenses.view') ? $this->searchExpenses($query) : [],
            'assets' => $user->can('assets.view') ? $this->searchAssets($query) : [],
            'accounts' => $user->can('accounts.view') ? $this->searchAccounts($query) : [],
            'meetings' => $user->can('clients.view') ? $this->searchMeetings($query) : [],
            'users' => $user->can('roles.view') ? $this->searchUsers($query) : [],
            'outlets' => $user->can('outlets.view') ? $this->searchOutlets($query) : [],
        ]);
    }

    private function emptyResults(): array
    {
        return [
            'clients' => [], 'invoices' => [], 'products' => [], 'notes' => [],
            'employees' => [], 'expenses' => [], 'assets' => [], 'accounts' => [],
            'meetings' => [], 'users' => [], 'outlets' => [],
        ];
    }

    protected function searchClients(string $query): array
    {
        return Client::query()
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('phone', 'like', "%{$query}%")
                    ->orWhere('client_uuid', 'like', "%{$query}%");
            })
            ->limit(5)
            ->get(['id', 'name', 'phone', 'client_uuid'])
            ->map(fn (Client $client) => [
                'id' => $client->id,
                'title' => $client->name,
                'subtitle' => $client->client_uuid ?? $client->phone,
                'url' => route('clients.show', $client->id),
            ])
            ->all();
    }

    protected function searchInvoices(string $query): array
    {
        return Invoice::query()
            ->tap(fn ($q) => OutletContext::scope($q))
            ->where('invoice_uuid', 'like', "%{$query}%")
            ->with('client:id,name')
            ->limit(5)
            ->get(['id', 'invoice_uuid', 'client_id', 'total', 'date'])
            ->map(fn (Invoice $invoice) => [
                'id' => $invoice->id,
                'title' => $invoice->invoice_uuid,
                'subtitle' => $invoice->client?->name.' · '.$invoice->date,
                'url' => route('invoices.show', $invoice->id),
            ])
            ->all();
    }

    protected function searchProducts(string $query): array
    {
        return Product::query()
            ->where('name', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'name', 'price'])
            ->map(fn (Product $product) => [
                'id' => $product->id,
                'title' => $product->name,
                'subtitle' => '৳'.number_format((float) $product->price, 2),
                'url' => route('products.index', ['search' => $product->name]),
            ])
            ->all();
    }

    protected function searchNotes(string $query): array
    {
        return Note::query()
            ->where('title', 'like', "%{$query}%")
            ->with('category:id,name')
            ->limit(5)
            ->get(['id', 'title', 'note_category_id'])
            ->map(fn (Note $note) => [
                'id' => $note->id,
                'title' => $note->title,
                'subtitle' => $note->category?->name ?? 'No Category',
                'url' => route('notes.index', ['search' => $note->title]),
            ])
            ->all();
    }

    protected function searchEmployees(string $query): array
    {
        return Employee::query()
            ->tap(fn ($q) => OutletContext::scope($q))
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('employee_id', 'like', "%{$query}%")
                    ->orWhere('phone', 'like', "%{$query}%");
            })
            ->limit(5)
            ->get(['id', 'name', 'employee_id', 'designation'])
            ->map(fn (Employee $employee) => [
                'id' => $employee->id,
                'title' => $employee->name,
                'subtitle' => $employee->employee_id.($employee->designation ? ' · '.$employee->designation : ''),
                'url' => route('employees.show', $employee->id),
            ])
            ->all();
    }

    protected function searchExpenses(string $query): array
    {
        return Expense::query()
            ->tap(fn ($q) => OutletContext::scope($q))
            ->where('description', 'like', "%{$query}%")
            ->with('category:id,name')
            ->limit(5)
            ->get(['id', 'description', 'amount', 'expense_category_id'])
            ->map(fn (Expense $expense) => [
                'id' => $expense->id,
                'title' => $expense->description ?: ($expense->category?->name ?? 'Expense'),
                'subtitle' => '৳'.number_format((float) $expense->amount, 2),
                'url' => route('expenses.show', $expense->id),
            ])
            ->all();
    }

    protected function searchAssets(string $query): array
    {
        return Asset::query()
            ->tap(fn ($q) => OutletContext::scope($q))
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%");
            })
            ->limit(5)
            ->get(['id', 'name', 'cost'])
            ->map(fn (Asset $asset) => [
                'id' => $asset->id,
                'title' => $asset->name,
                'subtitle' => '৳'.number_format((float) $asset->cost, 2),
                'url' => route('assets.index', ['search' => $asset->name]),
            ])
            ->all();
    }

    protected function searchAccounts(string $query): array
    {
        return Account::query()
            ->tap(fn ($q) => OutletContext::scope($q))
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('account_number', 'like', "%{$query}%");
            })
            ->limit(5)
            ->get(['id', 'name', 'account_number', 'current_balance'])
            ->map(fn (Account $account) => [
                'id' => $account->id,
                'title' => $account->name,
                'subtitle' => $account->account_number ?: '৳'.number_format((float) $account->current_balance, 2),
                'url' => route('accounts.show', $account->id),
            ])
            ->all();
    }

    protected function searchMeetings(string $query): array
    {
        return ClientActivity::query()
            ->tap(fn ($q) => OutletContext::scope($q))
            ->where('note', 'like', "%{$query}%")
            ->with('client:id,name')
            ->limit(5)
            ->get(['id', 'client_id', 'type', 'scheduled_at', 'note'])
            ->map(fn (ClientActivity $activity) => [
                'id' => $activity->id,
                'title' => $activity->client?->name.' — '.ucfirst(str_replace('_', ' ', $activity->type)),
                'subtitle' => $activity->scheduled_at,
                'url' => route('clients.show', $activity->client_id),
            ])
            ->all();
    }

    protected function searchUsers(string $query): array
    {
        return User::query()
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('email', 'like', "%{$query}%");
            })
            ->limit(5)
            ->get(['id', 'name', 'email'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'title' => $user->name,
                'subtitle' => $user->email,
                'url' => route('users.index', ['search' => $user->name]),
            ])
            ->all();
    }

    protected function searchOutlets(string $query): array
    {
        return Outlet::query()
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('code', 'like', "%{$query}%");
            })
            ->limit(5)
            ->get(['id', 'name', 'code'])
            ->map(fn (Outlet $outlet) => [
                'id' => $outlet->id,
                'title' => $outlet->name,
                'subtitle' => $outlet->code,
                'url' => route('outlets.index', ['search' => $outlet->name]),
            ])
            ->all();
    }
}
