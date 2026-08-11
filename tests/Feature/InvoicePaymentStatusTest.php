<?php

use App\Models\User;
use App\Models\Invoice;
use App\Models\Client;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->client = Client::create(['name' => 'John Doe', 'phone' => '123456789', 'total_paid' => 0, 'total_due' => 0]);
});

test('marking a partially paid invoice as Paid settles the full amount and stores a payment date', function () {
    $invoice = Invoice::create([
        'invoice_uuid' => 'INV-PAY-PARTIAL',
        'date' => now()->toDateString(),
        'client_id' => $this->client->id,
        'total' => 820,
        'paid' => 411,
        'due' => 409,
        'status' => 'Processing',
        'method' => 'Cash',
        'payment_status' => 'Unpaid',
        'payment_date' => null,
    ]);
    $this->client->update(['total_paid' => 411, 'total_due' => 409]);

    $response = $this->actingAs($this->user)->patch(route('invoices.update-payment-status', $invoice->id), [
        'payment_status' => 'Paid',
    ]);

    $response->assertRedirect();
    $invoice->refresh();
    expect($invoice->payment_status)->toBe('Paid');
    expect($invoice->payment_date)->toBe(now()->toDateString());
    expect((float) $invoice->paid)->toEqual(820.0);
    expect((float) $invoice->due)->toEqual(0.0);

    $this->client->refresh();
    expect((float) $this->client->total_paid)->toEqual(820.0);
    expect((float) $this->client->total_due)->toEqual(0.0);
});

test('marking an invoice as Unpaid resets paid to 0 and due to the full total', function () {
    $invoice = Invoice::create([
        'invoice_uuid' => 'INV-PAY-CLEAR',
        'date' => now()->toDateString(),
        'client_id' => $this->client->id,
        'total' => 100,
        'paid' => 100,
        'due' => 0,
        'status' => 'Processing',
        'method' => 'Cash',
        'payment_status' => 'Paid',
        'payment_date' => now()->toDateString(),
    ]);
    $this->client->update(['total_paid' => 100, 'total_due' => 0]);

    $response = $this->actingAs($this->user)->patch(route('invoices.update-payment-status', $invoice->id), [
        'payment_status' => 'Unpaid',
    ]);

    $response->assertRedirect();
    $invoice->refresh();
    expect($invoice->payment_status)->toBe('Unpaid');
    expect($invoice->payment_date)->toBeNull();
    expect((float) $invoice->paid)->toEqual(0.0);
    expect((float) $invoice->due)->toEqual(100.0);

    $this->client->refresh();
    expect((float) $this->client->total_paid)->toEqual(0.0);
    expect((float) $this->client->total_due)->toEqual(100.0);
});

test('invoice payment status update fails with an invalid value', function () {
    $invoice = Invoice::create([
        'invoice_uuid' => 'INV-PAY-INVALID',
        'date' => now()->toDateString(),
        'client_id' => $this->client->id,
        'total' => 100,
        'paid' => 100,
        'due' => 0,
        'status' => 'Processing',
        'method' => 'Cash',
        'payment_status' => 'Unpaid',
    ]);

    $response = $this->actingAs($this->user)->patch(route('invoices.update-payment-status', $invoice->id), [
        'payment_status' => 'PartiallyPaid',
    ]);

    $response->assertSessionHasErrors(['payment_status']);
});
