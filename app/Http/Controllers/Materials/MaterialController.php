<?php

namespace App\Http\Controllers\Materials;

use App\Exceptions\HasDependentRecordsException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Materials\StoreMaterialRequest;
use App\Http\Requests\Materials\UpdateMaterialRequest;
use App\Models\Account;
use App\Models\Material;
use App\Models\Unit;
use App\Support\OutletContext;
use App\Support\PerPage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaterialController extends Controller
{
    /** value => [column, direction] — whitelisted so the raw `sort` query param never reaches orderBy(). */
    private const SORTABLE = [
        'created_at:desc' => ['created_at', 'desc'],
        'name:asc' => ['name', 'asc'],
        'name:desc' => ['name', 'desc'],
    ];

    public function index(Request $request)
    {
        [$sortColumn, $sortDirection] = self::SORTABLE[$request->sort] ?? self::SORTABLE['created_at:desc'];
        $perPage = PerPage::resolve($request);

        $materials = Material::with('unit')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->unit_id, fn ($q, $unitId) => $q->where('unit_id', $unitId))
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('materials/index', [
            'materials' => $materials,
            'allMaterials' => Material::with('unit')->orderBy('name')->get(),
            'units' => Unit::orderBy('name')->get(),
            'accounts' => Account::tap(fn ($q) => OutletContext::scope($q))->orderBy('name')->get(['id', 'name', 'account_number']),
            'filters' => [
                'search' => $request->search,
                'unit_id' => $request->unit_id,
                'sort' => $request->sort,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(StoreMaterialRequest $request)
    {
        try {
            Material::create($request->validated());

            return redirect()->back()->with('success', 'Material created successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to create material.');
        }
    }

    public function update(UpdateMaterialRequest $request, Material $material)
    {
        try {
            $material->update($request->validated());

            return redirect()->back()->with('success', 'Material updated successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to update material.');
        }
    }

    public function destroy(Material $material)
    {
        try {
            if ($material->expenseMaterials()->exists()) {
                throw new HasDependentRecordsException($material->name, 'expense records using it');
            }

            $material->delete();

            return redirect()->back()->with('success', 'Material deleted successfully.');
        } catch (HasDependentRecordsException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to delete material.');
        }
    }
}
