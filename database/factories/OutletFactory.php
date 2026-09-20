<?php

namespace Database\Factories;

use App\Models\Outlet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Outlet>
 */
class OutletFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->city().' Outlet',
            'code' => strtoupper(fake()->unique()->lexify('???')),
            'address' => fake()->address(),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->unique()->companyEmail(),
            'status' => 'active',
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['status' => 'inactive']);
    }

    public function individualReportingOnly(): static
    {
        return $this->state(fn () => ['include_in_consolidated_reporting' => false]);
    }

    public function withDisabledFeatures(array $features): static
    {
        return $this->state(fn () => ['disabled_features' => $features]);
    }
}
