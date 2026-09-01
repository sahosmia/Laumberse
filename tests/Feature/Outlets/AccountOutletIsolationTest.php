<?php

use App\Models\Account;
use App\Models\Outlet;
use App\Models\User;

/** Same security matrix pattern as InvoiceOutletIsolationTest — see that file's header comment. */
function makeAccountFor(User $user, array $overrides = []): Account
{
    $data = array_merge([
        'name' => 'Account-'.uniqid(),
        'opening_balance' => 1000,
    ], $overrides);

    test()->actingAs($user)->post(route('accounts.store'), $data)->assertSessionHasNoErrors();

    return Account::latest('id')->first();
}

test('a user only sees accounts from their own outlet in the index', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Accountant');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Accountant');

    $accountA = makeAccountFor($userA);
    $accountB = makeAccountFor($userB);

    $response = test()->actingAs($userA)->get(route('accounts.index'));

    $ids = collect($response->viewData('page')['props']['accounts']['data'])->pluck('id');
    expect($ids)->toContain($accountA->id);
    expect($ids)->not->toContain($accountB->id);

    $allIds = collect($response->viewData('page')['props']['allAccounts'])->pluck('id');
    expect($allIds)->toContain($accountA->id);
    expect($allIds)->not->toContain($accountB->id);
});

test('a user cannot view another outlet\'s account ledger', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Accountant');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Accountant');

    $accountB = makeAccountFor($userB);

    test()->actingAs($userA)->get(route('accounts.show', $accountB))->assertNotFound();
});

test('a user cannot rename another outlet\'s account', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    // Accountant doesn't hold accounts.edit by default (see Permissions::defaultsByRole) — granted
    // explicitly here since this test is about outlet isolation, not role permissions.
    $userA->assignRole('Accountant');
    $userA->givePermissionTo('accounts.edit');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Accountant');

    $accountB = makeAccountFor($userB);
    $originalName = $accountB->name;

    test()->actingAs($userA)->put(route('accounts.update', $accountB), [
        'name' => 'Hacked Name',
    ])->assertNotFound();

    expect($accountB->fresh()->name)->toBe($originalName);
});

test('an account is always assigned to the creator\'s own outlet, even if a different outlet_id is forged in the payload', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Accountant');

    $account = makeAccountFor($userA, ['outlet_id' => $outletB->id]);

    expect($account->outlet_id)->toBe($userA->outlet_id)
        ->and($account->outlet_id)->not->toBe($outletB->id);
});

test('funds cannot be transferred between accounts in different outlets', function () {
    $outletB = Outlet::factory()->create();
    $admin = User::factory()->admin()->create();
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Accountant');

    $accountAdmin = makeAccountFor($admin);
    $accountB = makeAccountFor($userB);

    // Admin holds every permission and, via canAccess(), can even reach both records individually —
    // but the transfer itself must still be rejected because the two legs sit in different outlets.
    test()->actingAs($admin)->post(route('outlet-context.update'), ['outlet' => 'all'])
        ->assertRedirect()->assertSessionHasNoErrors();

    $response = test()->actingAs($admin)->post(route('account-transfers.store'), [
        'from_account_id' => $accountAdmin->id,
        'to_account_id' => $accountB->id,
        'amount' => 100,
        'date' => now()->format('Y-m-d'),
    ]);

    $response->assertSessionHas('error');
    expect((float) $accountAdmin->fresh()->current_balance)->toEqual(1000.0);
    expect((float) $accountB->fresh()->current_balance)->toEqual(1000.0);
});

test('a user cannot transfer funds involving another outlet\'s account', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Accountant');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Accountant');

    $accountA = makeAccountFor($userA);
    $accountB = makeAccountFor($userB);

    test()->actingAs($userA)->post(route('account-transfers.store'), [
        'from_account_id' => $accountA->id,
        'to_account_id' => $accountB->id,
        'amount' => 100,
        'date' => now()->format('Y-m-d'),
    ])->assertNotFound();
});

test('an admin who switches to All Outlets sees accounts from every outlet', function () {
    $outletB = Outlet::factory()->create();
    $admin = User::factory()->admin()->create();
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Accountant');

    $accountAdmin = makeAccountFor($admin);
    $accountB = makeAccountFor($userB);

    test()->actingAs($admin)->post(route('outlet-context.update'), ['outlet' => 'all'])
        ->assertRedirect()->assertSessionHasNoErrors();

    $response = test()->actingAs($admin)->get(route('accounts.index'));

    $ids = collect($response->viewData('page')['props']['accounts']['data'])->pluck('id');
    expect($ids)->toContain($accountAdmin->id);
    expect($ids)->toContain($accountB->id);
});

test('creating an account while viewing All Outlets requires a valid outlet_id', function () {
    $admin = User::factory()->admin()->create();
    test()->actingAs($admin)->post(route('outlet-context.update'), ['outlet' => 'all'])
        ->assertRedirect()->assertSessionHasNoErrors();

    $response = test()->actingAs($admin)->post(route('accounts.store'), [
        'name' => 'New Account',
        'opening_balance' => 0,
    ]);

    $response->assertSessionHasErrors(['outlet_id']);
});
