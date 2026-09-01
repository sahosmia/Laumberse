<?php

namespace Database\Factories;

use App\Models\Outlet;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            // Mirrors the real backfill behavior (see the outlet_id migration): a fresh user
            // defaults to whatever outlet already exists (e.g. the seeded "Main Outlet") rather
            // than none, so existing outlet-scoped create/update tests don't have to start
            // passing an explicit outlet just because a user now has this column. Tests that
            // specifically need cross-outlet scenarios still override it: `for($outletB)`.
            // oldest('id') matters once a test creates a second outlet before creating a user —
            // value('id') with no ORDER BY is not guaranteed to return the seeded Main Outlet.
            'outlet_id' => Outlet::query()->oldest('id')->value('id'),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Assigns the real seeded 'Admin' role (see RoleSeeder), which — via the Gate::before hook in
     * AppServiceProvider — bypasses every `permission:*` route-middleware check. Opt-in only: a
     * bare `User::factory()->create()` still yields a user with no role and no permissions at all,
     * so tests that specifically need to verify a 403 for an under-privileged user are unaffected.
     */
    public function admin(): static
    {
        return $this->afterCreating(function (\App\Models\User $user) {
            $user->assignRole('Admin');
        });
    }
}
