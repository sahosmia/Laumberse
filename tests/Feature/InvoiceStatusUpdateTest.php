<?php

use App\Models\Client;
use App\Models\Invoice;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->admin()->create();
    $this->client = Client::create(['name' => 'John Doe', 'phone' => '123456789']);
});

test('invoice status can be updated inline', function () {
    $invoice = Invoice::create([
        'invoice_uuid' => 'INV-STATUS-TEST',
        'date' => now()->toDateString(),
        'client_id' => $this->client->id,
        'total' => 100,
        'paid' => 100,
        'due' => 0,
        'status' => 'In House',
        'method' => 'Cash',
    ]);

    $response = $this->actingAs($this->user)->patch(route('invoices.update-status', $invoice->id), [
        'status' => 'Delivered',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('invoices', [
        'id' => $invoice->id,
        'status' => 'Delivered',
    ]);
});

test('invoice status update fails with invalid status', function () {
    $invoice = Invoice::create([
        'invoice_uuid' => 'INV-STATUS-FAIL',
        'date' => now()->toDateString(),
        'client_id' => $this->client->id,
        'total' => 100,
        'paid' => 100,
        'due' => 0,
        'status' => 'In House',
        'method' => 'Cash',
    ]);

    $response = $this->actingAs($this->user)->patch(route('invoices.update-status', $invoice->id), [
        'status' => 'InvalidStatus',
    ]);

    $response->assertSessionHasErrors(['status']);
});
