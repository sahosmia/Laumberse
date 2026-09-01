<?php

namespace App\Http\Controllers\Notes;

use App\Http\Controllers\Controller;
use App\Http\Requests\Notes\StoreNoteRequest;
use App\Http\Requests\Notes\UpdateNoteRequest;
use App\Models\Note;
use App\Models\NoteCategory;
use App\Support\PerPage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NoteController extends Controller
{
    /** value => [column, direction] — whitelisted so the raw `sort` query param never reaches orderBy(). */
    private const SORTABLE = [
        'created_at:desc' => ['created_at', 'desc'],
        'title:asc' => ['title', 'asc'],
        'title:desc' => ['title', 'desc'],
    ];

    public function index(Request $request)
    {
        [$sortColumn, $sortDirection] = self::SORTABLE[$request->sort] ?? self::SORTABLE['created_at:desc'];
        $perPage = PerPage::resolve($request);

        $notes = Note::with('category')
            ->when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                    ->orWhere('details', 'like', "%{$s}%");
            }))
            ->when($request->note_category_id, fn ($q, $categoryId) => $q->where('note_category_id', $categoryId))
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('notes/index', [
            'notes' => $notes,
            'categories' => NoteCategory::orderBy('name')->get(),
            'filters' => [
                'search' => $request->search,
                'note_category_id' => $request->note_category_id,
                'sort' => $request->sort,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function show(Note $note)
    {
        return Inertia::render('notes/show', [
            'note' => $note->load('category'),
        ]);
    }

    public function store(StoreNoteRequest $request)
    {
        try {
            Note::create($request->validated());

            return redirect()->back()->with('success', 'Note created successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to create note.');
        }
    }

    public function update(UpdateNoteRequest $request, Note $note)
    {
        try {
            $note->update($request->validated());

            return redirect()->back()->with('success', 'Note updated successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to update note.');
        }
    }

    public function destroy(Note $note)
    {
        try {
            $note->delete();

            return redirect()->back()->with('success', 'Note deleted successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to delete note.');
        }
    }
}
