<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use App\Http\Requests\Units\StoreUnitRequest;
use App\Http\Requests\Units\UpdateUnitRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UnitController extends Controller
{
    public function index(Request $request)
    {
        $units = Unit::when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('short_name', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('units/index', [
            'units' => $units,
            'filters' => ['search' => $request->search],
        ]);
    }

    public function store(StoreUnitRequest $request)
    {
        Unit::create($request->validated());

        return redirect()->back()->with('success', 'Unit created successfully.');
    }

    public function update(UpdateUnitRequest $request, Unit $unit)
    {
        $unit->update($request->validated());

        return redirect()->back()->with('success', 'Unit updated successfully.');
    }

    public function destroy(Unit $unit)
    {
        $unit->delete();

        return redirect()->back()->with('success', 'Unit deleted successfully.');
    }
}
