<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\Client;
use App\Models\Employee;
use App\Models\EmployeeTransaction;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\ExpenseMaterial;
use App\Models\GlobalSetting;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Material;
use App\Models\Product;
use App\Models\User;

// Regression coverage for all six HasDependentRecordsException guard sites audited in
// P1.4/P1.8 (5 inline in controllers, 1 inside DeleteProductAction). None of these had any
// dedicated test before this file — every "cannot be deleted" case below closes a genuine,
// previously-untested gap, not a duplicate of existing coverage. Each pair proves both directions:
// deletion succeeds with no dependents, and is blocked (exact message, record still present) when
// a dependent exists.

test('a category with no products can be deleted', function () {
    $user = User::factory()->admin()->create();
    $category = Category::create(['name' => 'Empty Category', 'slug' => 'empty-category']);

    $this->actingAs($user)->delete(route('categories.destroy', $category))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});

test('a category with products cannot be deleted', function () {
    $user = User::factory()->admin()->create();
    $category = Category::create(['name' => 'Used Category', 'slug' => 'used-category']);
    Product::create(['name' => 'Guard Test Product A', 'category_id' => $category->id, 'price' => 100]);

    $response = $this->actingAs($user)->delete(route('categories.destroy', $category));

    $response->assertSessionHas('error', 'Cannot delete Used Category — it has products assigned to it. Remove those first.');
    $this->assertDatabaseHas('categories', ['id' => $category->id]);
});

test('an expense category with no expenses can be deleted', function () {
    $user = User::factory()->admin()->create();
    $category = ExpenseCategory::create(['name' => 'Unused Expense Category']);

    $this->actingAs($user)->delete(route('expense-categories.destroy', $category))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('expense_categories', ['id' => $category->id]);
});

test('an expense category with expenses recorded cannot be deleted', function () {
    $user = User::factory()->admin()->create();
    $category = ExpenseCategory::create(['name' => 'Used Expense Category']);
    $account = Account::create(['name' => 'Cash', 'opening_balance' => 0, 'current_balance' => 0]);
    Expense::create([
        'expense_category_id' => $category->id, 'account_id' => $account->id,
        'type' => 'general', 'amount' => 100, 'payment_method' => 'Cash',
        'date' => now()->toDateString(), 'description' => 'Guard test expense',
    ]);

    $response = $this->actingAs($user)->delete(route('expense-categories.destroy', $category));

    $response->assertSessionHas('error', 'Cannot delete Used Expense Category — it has expenses recorded against it. Remove those first.');
    $this->assertDatabaseHas('expense_categories', ['id' => $category->id]);
});

test('an expense category assigned in Global Settings cannot be deleted even with zero expenses recorded', function () {
    // Regression guard: the "no expenses recorded" check above didn't catch a category that's
    // wired up as e.g. the Salary category in Global Settings but hasn't had any expense posted
    // against it yet — deleting it silently broke that setting's reference.
    $user = User::factory()->admin()->create();
    $category = ExpenseCategory::create(['name' => 'Salary']);
    GlobalSetting::set('salary_category_id', $category->id);

    $response = $this->actingAs($user)->delete(route('expense-categories.destroy', $category));

    $response->assertSessionHas('error', "Cannot delete Salary — it's currently assigned to the Salary Expense Category setting. Change that setting first.");
    $this->assertDatabaseHas('expense_categories', ['id' => $category->id]);
});

test('an expense category not referenced by any Global Setting can still be deleted', function () {
    $user = User::factory()->admin()->create();
    $salaryCategory = ExpenseCategory::create(['name' => 'Salary']);
    GlobalSetting::set('salary_category_id', $salaryCategory->id);
    $unrelatedCategory = ExpenseCategory::create(['name' => 'Office Supplies']);

    $this->actingAs($user)->delete(route('expense-categories.destroy', $unrelatedCategory))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('expense_categories', ['id' => $unrelatedCategory->id]);
});

test('a client with no orders can be deleted', function () {
    $user = User::factory()->admin()->create();
    $client = Client::create(['name' => 'No Orders', 'phone' => '01700000030']);

    $this->actingAs($user)->delete(route('clients.destroy', $client))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('clients', ['id' => $client->id]);
});

test('a client with existing orders cannot be deleted', function () {
    $user = User::factory()->admin()->create();
    $client = Client::create(['name' => 'Has Orders', 'phone' => '01700000031']);
    Invoice::create([
        'invoice_uuid' => 'INV-GUARD-1', 'date' => now()->toDateString(), 'client_id' => $client->id,
        'total' => 100, 'paid' => 100, 'due' => 0, 'status' => 'In House', 'method' => 'Cash',
    ]);

    $response = $this->actingAs($user)->delete(route('clients.destroy', $client));

    $response->assertSessionHas('error', 'Cannot delete Has Orders — it has existing orders in their history. Remove those first.');
    $this->assertDatabaseHas('clients', ['id' => $client->id]);
});

test('an employee with no payroll or transaction history can be deleted', function () {
    $user = User::factory()->admin()->create();
    $employee = Employee::create([
        'name' => 'No History', 'phone' => '01700000032', 'designation' => 'Staff', 'base_salary' => 10000, 'is_active' => true,
    ]);

    $this->actingAs($user)->delete(route('employees.destroy', $employee))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('employees', ['id' => $employee->id]);
});

test('an employee with transaction history cannot be deleted', function () {
    $user = User::factory()->admin()->create();
    $employee = Employee::create([
        'name' => 'Has History', 'phone' => '01700000033', 'designation' => 'Staff', 'base_salary' => 10000, 'is_active' => true,
    ]);
    $account = Account::create(['name' => 'Cash', 'opening_balance' => 10000, 'current_balance' => 10000]);
    EmployeeTransaction::create([
        'employee_id' => $employee->id, 'account_id' => $account->id,
        'transaction_type' => 'advance', 'amount' => 1000, 'date' => now()->toDateString(),
    ]);

    $response = $this->actingAs($user)->delete(route('employees.destroy', $employee));

    $response->assertSessionHas('error', 'Cannot delete Has History — it has payroll or advance/loan history. Remove those first.');
    $this->assertDatabaseHas('employees', ['id' => $employee->id]);
});

test('a material with no expense records can be deleted', function () {
    $user = User::factory()->admin()->create();
    $material = Material::create(['name' => 'Unused Material']);

    $this->actingAs($user)->delete(route('materials.destroy', $material))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('materials', ['id' => $material->id]);
});

test('a material used in an expense record cannot be deleted', function () {
    $user = User::factory()->admin()->create();
    $material = Material::create(['name' => 'Used Material']);
    $category = ExpenseCategory::create(['name' => 'Material Guard Test Category']);
    $account = Account::create(['name' => 'Cash', 'opening_balance' => 0, 'current_balance' => 0]);
    $expense = Expense::create([
        'expense_category_id' => $category->id, 'account_id' => $account->id,
        'type' => 'material', 'amount' => 500, 'payment_method' => 'Cash',
        'date' => now()->toDateString(), 'description' => 'Material purchase',
    ]);
    ExpenseMaterial::create([
        'expense_id' => $expense->id, 'material_id' => $material->id,
        'quantity' => 5, 'unit_price' => 100, 'amount' => 500,
    ]);

    $response = $this->actingAs($user)->delete(route('materials.destroy', $material));

    $response->assertSessionHas('error', 'Cannot delete Used Material — it has expense records using it. Remove those first.');
    $this->assertDatabaseHas('materials', ['id' => $material->id]);
});

test('a product not used in any invoice can be deleted', function () {
    $user = User::factory()->admin()->create();
    $category = Category::create(['name' => 'Guard Test Category B', 'slug' => 'guard-test-category-b']);
    $product = Product::create(['name' => 'Unused Product', 'category_id' => $category->id, 'price' => 100]);

    $this->actingAs($user)->delete(route('products.destroy', $product))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('products', ['id' => $product->id]);
});

test('a product used in a past invoice cannot be deleted', function () {
    $user = User::factory()->admin()->create();
    $category = Category::create(['name' => 'Guard Test Category C', 'slug' => 'guard-test-category-c']);
    $product = Product::create(['name' => 'Used Product', 'category_id' => $category->id, 'price' => 100]);
    $client = Client::create(['name' => 'Buyer', 'phone' => '01700000034']);
    $invoice = Invoice::create([
        'invoice_uuid' => 'INV-GUARD-2', 'date' => now()->toDateString(), 'client_id' => $client->id,
        'total' => 100, 'paid' => 100, 'due' => 0, 'status' => 'In House', 'method' => 'Cash',
    ]);
    InvoiceItem::create(['invoice_id' => $invoice->id, 'product_id' => $product->id, 'qty' => 1, 'price' => 100]);

    $response = $this->actingAs($user)->delete(route('products.destroy', $product));

    $response->assertSessionHas('error', 'Cannot delete Used Product — it has past invoices that include it. Remove those first.');
    $this->assertDatabaseHas('products', ['id' => $product->id]);
});
