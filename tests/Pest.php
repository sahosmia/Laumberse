<?php

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind a different classes or traits.
|
*/

/*
|--------------------------------------------------------------------------
| Feature test setup
|--------------------------------------------------------------------------
|
| Every route in this app is gated by a Spatie `permission:{module}.{action}` middleware string,
| so the `roles`/`permissions` tables must exist and be populated before any Feature test can get
| past that middleware. RefreshDatabase migrates the schema fresh per test but does NOT seed it,
| so this runs the lightweight, deterministic seeders every Feature test actually depends on (not
| the full DatabaseSeeder, which also seeds slow, randomized demo business data that has nothing
| to do with what most tests are exercising).
|
| OutletSeeder must run here too (not just in production): UserFactory::definition() reads the
| first existing Outlet's id for every user it creates, mirroring the real backfill migration's
| behavior — without a seeded "Main Outlet" here, every factory-created user in every existing
| test would suddenly have a null outlet_id, and the outlet-scoped modules would treat their
| requests as "All Outlets" instead of "Main Outlet," breaking dozens of unrelated tests that
| have nothing to do with outlets.
|
*/

pest()->extend(Tests\TestCase::class)
    ->use(Illuminate\Foundation\Testing\RefreshDatabase::class)
    ->beforeEach(function () {
        $this->seed([
            Database\Seeders\OutletSeeder::class,
            Database\Seeders\PermissionSeeder::class,
            Database\Seeders\RoleSeeder::class,
        ]);
    })
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

function something()
{
    // ..
}

/**
 * Creates a fully-authorized user (real seeded 'Admin' role — see RoleSeeder) and authenticates
 * the current test as them. Convenience for tests whose subject is business logic, not
 * authorization itself. Tests that specifically verify a 403 for an under-privileged user should
 * keep using a bare `User::factory()->create()` (no role) instead of this helper.
 */
function actingAsAdmin(): App\Models\User
{
    $user = App\Models\User::factory()->admin()->create();

    test()->actingAs($user);

    return $user;
}
