<?php

use App\Models\Client;
use App\Models\Invoice;

function createClientWithInvoice(string $username, array $invoiceOverrides = []): array
{
    $client = Client::create([
        'name' => 'Client '.$username,
        'phone' => '01700000000',
        'type' => 'Consumer',
        'username' => $username,
        'password' => 'secret123',
    ]);

    $invoice = Invoice::create(array_merge([
        'invoice_uuid' => 'INV-'.$username,
        'date' => now()->format('Y-m-d'),
        'client_id' => $client->id,
        'total' => 1000,
        'paid' => 1000,
        'due' => 0,
        'status' => 'Delivered',
        'payment_status' => 'Paid',
        'method' => 'Cash',
    ], $invoiceOverrides));

    return [$client, $invoice];
}

test('a client only sees their own invoices in the portal', function () {
    [$clientA, $invoiceA] = createClientWithInvoice('client-a');
    [$clientB, $invoiceB] = createClientWithInvoice('client-b');

    $response = $this->actingAs($clientA, 'client')->get(route('portal.invoices.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('portal/invoices/index')
        ->has('invoices.data', 1)
        ->where('invoices.data.0.id', $invoiceA->id)
    );
});

test('a client can view their own invoice detail', function () {
    [$client, $invoice] = createClientWithInvoice('client-a');

    $response = $this->actingAs($client, 'client')->get(route('portal.invoices.show', $invoice));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('portal/invoices/show')
        ->where('invoice.id', $invoice->id)
    );
});

test('a client cannot view another client\'s invoice', function () {
    [$clientA] = createClientWithInvoice('client-a');
    [, $invoiceB] = createClientWithInvoice('client-b');

    $response = $this->actingAs($clientA, 'client')->get(route('portal.invoices.show', $invoiceB));

    $response->assertForbidden();
});
