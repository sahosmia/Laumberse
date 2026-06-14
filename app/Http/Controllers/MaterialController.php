<?php

namespace App\Http\Controllers;

use App\Http\Requests\Materials\StoreMaterialRequest;
use App\Http\Requests\Materials\UpdateMaterialRequest;
use App\Models\Material;
use Inertia\Inertia;

class MaterialController extends Controller
{
    public function index()
    {
        return Inertia::render('materials/index', [
            'materials' => Material::orderBy('name')->get(),
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
