<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Admin holds every permission implicitly, so new permissions never need re-assigning to it.
        Gate::before(function ($user, string $ability) {
            return $user->hasRole('Admin') ? true : null;
        });

        // @bn($text) — Bangla-aware text output for PDF (DOMPDF) views. See BanglaPdfText.
        Blade::directive('bn', fn ($expression) => "<?php echo \App\Support\BanglaPdfText::render({$expression}); ?>");
    }
}
