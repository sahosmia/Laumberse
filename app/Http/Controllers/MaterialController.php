<?php

namespace App\Http\Controllers;

use App\Http\Requests\Materials\StoreMaterialRequest;
use App\Http\Requests\Materials\UpdateMaterialRequest;
use App\Models\Material;
use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaterialController extends Controller
{
    public function index(Request $request)
    {
        $materials = Material::with('unit')
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderBy('name')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('materials/index', [
            'materials' => $materials,
            'units' => Unit::orderBy('name')->get(),
            'filters' => ['search' => $request->search],
        ]);
    }

    public function store(StoreMaterialRequest $request)
    {
        Material::create($request->validated());
        return redirect()->back()->with('success', 'Material created successfully.');
    }

    public function update(UpdateMaterialRequest $request, Material $material)
    {
        $material->update($request->validated());
        return redirect()->back()->with('success', 'Material updated successfully.');
    }

    public function destroy(Material $material)
    {
        $material->delete();
        return redirect()->back()->with('success', 'Material deleted successfully.');
    }
}
