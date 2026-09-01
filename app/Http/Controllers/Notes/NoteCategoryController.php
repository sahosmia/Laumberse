<?php

namespace App\Http\Controllers\Notes;

use App\Http\Controllers\Controller;
use App\Http\Requests\Notes\StoreNoteCategoryRequest;
use App\Http\Requests\Notes\UpdateNoteCategoryRequest;
use App\Models\NoteCategory;
use App\Support\PerPage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NoteCategoryController extends Controller
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

        $categories = NoteCategory::when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
            $q->where('name', 'like', "%{$s}%")->orWhere('description', 'like', "%{$s}%");
        }))
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('notes/categories/index', [
            'categories' => $categories,
            'filters' => [
                'search' => $request->search,
                'sort' => $request->sort,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(StoreNoteCategoryRequest $request)
    {
        try {
            NoteCategory::create($request->validated());

            return redirect()->back()->with('success', 'Note category created successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to create note category.');
        }
    }

    public function update(UpdateNoteCategoryRequest $request, NoteCategory $note_category)
    {
        try {
            $note_category->update($request->validated());

            return redirect()->back()->with('success', 'Note category updated successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to update note category.');
        }
    }

    public function destroy(NoteCategory $note_category)
    {
        try {
            $note_category->delete();

            return redirect()->back()->with('success', 'Note category deleted successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to delete note category.');
        }
    }
}
