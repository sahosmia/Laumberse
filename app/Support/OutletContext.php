<?php

namespace App\Support;

use App\Models\Outlet;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

/**
 * Single source of truth for "which outlet's data is currently in scope" — every outlet-scoped
 * controller/service reads this instead of trusting a request parameter, session key, or React
 * state directly. A normal user's `currentId()` is always their own assigned outlet, full stop;
 * `resolveForWrite()` is the only place a submitted outlet_id is ever even looked at, and only
 * for a user who holds `outlets.switch` AND is currently viewing "All Outlets".
 *
 * Active outlet is stored server-side in the session (see OutletContextController) — never in
 * localStorage/React state, so there is nothing for the frontend to tamper with that the backend
 * doesn't independently re-validate on every read.
 */
class OutletContext
{
    private const SESSION_KEY = 'active_outlet_id';

    private const ALL = 'all';

    /** The user's fixed home outlet — null only for a global user with no single assigned outlet. */
    public static function assignedId(): ?int
    {
        return auth()->user()?->outlet_id;
    }

    public static function canSwitch(): bool
    {
        return (bool) auth()->user()?->can('outlets.switch');
    }

    /**
     * The outlet_id every outlet-scoped read should be filtered to, or null when the active
     * context is "All Outlets" (only reachable by a user who holds outlets.switch).
     */
    public static function currentId(): ?int
    {
        if (! self::canSwitch()) {
            return self::assignedId();
        }

        $selected = session(self::SESSION_KEY);

        if ($selected === self::ALL) {
            return null;
        }

        if ($selected && Outlet::whereKey($selected)->active()->exists()) {
            return (int) $selected;
        }

        // No valid selection yet this session — default to the admin's own home outlet if they
        // have one, otherwise fall back to "All Outlets".
        return self::assignedId();
    }

    public static function isAll(): bool
    {
        return self::canSwitch() && self::currentId() === null;
    }

    public static function current(): ?Outlet
    {
        $id = self::currentId();

        return $id ? Outlet::find($id) : null;
    }

    /**
     * Every outlet the current user is allowed to select — every active outlet for a
     * switch-capable user, or just their own single assigned outlet otherwise (never empty for a
     * normal user in practice, since outlet_id is required for them).
     *
     * @return Collection<int, Outlet>
     */
    public static function available(): Collection
    {
        if (self::canSwitch()) {
            return Outlet::active()->orderBy('name')->get();
        }

        $assigned = auth()->user()?->outlet;

        return $assigned ? new Collection([$assigned]) : new Collection;
    }

    /**
     * Sets the active outlet for the rest of this session. $target is an outlet id or the
     * literal string "all". Only a switch-capable user may select "all" or an outlet other than
     * their own — callers must check canSwitch() before calling this (see OutletContextController).
     */
    public static function set(string $target): void
    {
        if ($target === self::ALL) {
            session([self::SESSION_KEY => self::ALL]);

            return;
        }

        session([self::SESSION_KEY => (int) $target]);
    }

    public static function forget(): void
    {
        session()->forget(self::SESSION_KEY);
    }

    /**
     * The single authoritative outlet_id for a create/update on an outlet-scoped record.
     * NEVER derived from request input except in the one narrow case where that's actually safe:
     * a switch-capable user currently viewing "All Outlets" — everyone else's outlet_id is
     * whatever their resolved context already is, regardless of anything the client submitted.
     *
     * @throws ValidationException if the active context is "All Outlets" and no valid outlet_id was submitted.
     */
    public static function resolveForWrite(mixed $submittedOutletId = null): int
    {
        if (! self::isAll()) {
            return self::currentId();
        }

        $id = is_numeric($submittedOutletId) ? (int) $submittedOutletId : null;

        if ($id && Outlet::whereKey($id)->active()->exists()) {
            return $id;
        }

        throw ValidationException::withMessages([
            'outlet_id' => 'Select an outlet before creating this record — "All Outlets" is a view, not a place to save new records.',
        ]);
    }

    /**
     * Non-throwing counterpart to resolveForWrite(), for use inside validation `exists` rule
     * closures — throwing there surfaces as an uncaught exception instead of a clean 422. Returns
     * the outlet a new record would be written to if one can be determined right now, or null
     * when it can't yet (e.g. "All Outlets" with no outlet_id submitted). Callers should treat
     * null as "match nothing," letting the outlet_id field's own validation rule report the
     * actual error.
     */
    public static function resolvableForWrite(mixed $submittedOutletId = null): ?int
    {
        if (! self::isAll()) {
            return self::currentId();
        }

        $id = is_numeric($submittedOutletId) ? (int) $submittedOutletId : null;

        return ($id && Outlet::whereKey($id)->active()->exists()) ? $id : null;
    }

    /**
     * True if a record belonging to $recordOutletId is visible under the current context — while
     * viewing "All Outlets", OR when there's no authenticated context at all (a console command or
     * queued job, which has no session/user and must not be blocked by outlet scoping — see
     * scope() below).
     */
    public static function canAccess(?int $recordOutletId): bool
    {
        $id = self::currentId();

        return $id === null || $id === $recordOutletId;
    }

    /**
     * Applies the active outlet scope to a query — a no-op while viewing "All Outlets", and
     * likewise a no-op outside any authenticated context (a console command or queued job): both
     * cases resolve currentId() to null, and filtering to `outlet_id = null` would silently match
     * nothing rather than "everything," which is never the intended behavior for either case.
     */
    public static function scope(Builder $query, string $column = 'outlet_id'): Builder
    {
        $id = self::currentId();

        if ($id !== null) {
            $query->where($column, $id);
        }

        return $query;
    }
}
