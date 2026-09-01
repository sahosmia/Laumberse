<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProductPriceController extends Controller
{
    public function index()
    {
        $client = Auth::guard('client')->user();

        $prices = $client->customPrices()
            ->with('product')
            ->paginate(50);

        return Inertia::render('portal/prices/index', [
            'prices' => $prices,
        ]);
    }
}
