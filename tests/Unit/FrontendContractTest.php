<?php

use App\Enums\AssetStatus;
use App\Enums\ClientType;
use App\Enums\DiscountType;
use App\Enums\InvoiceStatus;
use App\Enums\PaymentStatus;
use App\Enums\PayrollStatus;
use App\Support\Permissions;

/**
 * Guards against silent drift between backend PHP enums / App\Support\Permissions and their
 * hand-maintained frontend mirrors in resources/js/constants/status.ts and
 * resources/js/constants/permissions.ts — flagged in the P2.1 frontend audit as the project's
 * biggest TypeScript contract risk, since nothing currently fails the build if a backend value
 * changes and the frontend mirror is forgotten.
 *
 * CONTRACT BOUNDARY: there is no TypeScript runtime inside Pest, and a code-generation pipeline
 * or a Node/TS-parser bridge would be far more machinery than this risk warrants (and both are
 * explicitly out of scope for this guard). Instead, these tests read the raw .ts source text and
 * extract each relevant `export const NAME = [...]` / `= {...}` block with a narrow,
 * single-purpose regex — good enough for this project's simple string-literal-array/object
 * format, not a general TypeScript parser. This verifies the CURRENT content of the real
 * frontend file directly (not a hand-copied snapshot that could itself drift out of sync), so
 * renaming, adding, removing, or changing a value on either side fails the corresponding test
 * until both sides agree again.
 */
/**
 * `tests/Unit` isn't bound to `Tests\TestCase` in tests/Pest.php (only `Feature` is), so there's
 * no booted Laravel application here and `base_path()` isn't available — resolve from this file's
 * own location instead, which needs no framework bootstrap at all.
 */
function repoPath(string $relativePath): string
{
    return __DIR__.'/../../'.$relativePath;
}

function frontendConstArray(string $relativePath, string $constName): array
{
    $contents = file_get_contents(repoPath($relativePath));

    if (! preg_match('/export const '.preg_quote($constName, '/').'\s*(?::[^=]*)?=\s*\[(.*?)\]/s', $contents, $match)) {
        throw new RuntimeException("Could not find `export const {$constName} = [...]` in {$relativePath}. Has it been renamed or removed?");
    }

    return frontendQuotedStrings($match[1]);
}

function frontendObjectBlock(string $relativePath, string $constName): string
{
    $contents = file_get_contents(repoPath($relativePath));

    if (! preg_match('/export const '.preg_quote($constName, '/').'\s*(?::[^=]*)?=\s*\{(.*?)\n\}\s*(?:as const)?;/s', $contents, $match)) {
        throw new RuntimeException("Could not find `export const {$constName} = {...}` in {$relativePath}. Has it been renamed or removed?");
    }

    return $match[1];
}

function frontendQuotedStrings(string $block): array
{
    preg_match_all("/'([^']*)'/", $block, $matches);

    return $matches[1];
}

function sorted(array $values): array
{
    sort($values);

    return $values;
}

const STATUS_TS_PATH = 'resources/js/constants/status.ts';
const PERMISSIONS_TS_PATH = 'resources/js/constants/permissions.ts';

test('ClientType enum matches frontend CLIENT_TYPES', function () {
    $backend = array_map(fn ($case) => $case->value, ClientType::cases());
    $frontend = frontendConstArray(STATUS_TS_PATH, 'CLIENT_TYPES');

    expect(sorted($frontend))->toBe(sorted($backend));
});

test('InvoiceStatus enum matches frontend INVOICE_STATUSES', function () {
    $frontend = frontendConstArray(STATUS_TS_PATH, 'INVOICE_STATUSES');

    expect(sorted($frontend))->toBe(sorted(InvoiceStatus::values()));
});

test('InvoiceStatus form-selectable subset matches frontend INVOICE_FORM_STATUSES', function () {
    // formValues() is currently the same 9-status set as values() — every stage of the wash
    // pipeline (In House through Ready), plus Delivered and Cancelled, is settable directly on
    // the create/edit form. Still guarded as a distinct contract from INVOICE_STATUSES above in
    // case the two ever diverge again.
    $frontend = frontendConstArray(STATUS_TS_PATH, 'INVOICE_FORM_STATUSES');

    expect(sorted($frontend))->toBe(sorted(InvoiceStatus::formValues()));
});

test('PaymentStatus enum matches frontend PAYMENT_STATUSES', function () {
    $frontend = frontendConstArray(STATUS_TS_PATH, 'PAYMENT_STATUSES');

    expect(sorted($frontend))->toBe(sorted(PaymentStatus::values()));
});

test('DiscountType enum matches frontend DISCOUNT_TYPES', function () {
    $frontend = frontendConstArray(STATUS_TS_PATH, 'DISCOUNT_TYPES');

    expect(sorted($frontend))->toBe(sorted(DiscountType::values()));
});

test('AssetStatus enum matches frontend ASSET_STATUSES', function () {
    $frontend = frontendConstArray(STATUS_TS_PATH, 'ASSET_STATUSES');

    expect(sorted($frontend))->toBe(sorted(AssetStatus::values()));
});

test('PayrollStatus enum matches frontend PAYROLL_STATUSES', function () {
    $frontend = frontendConstArray(STATUS_TS_PATH, 'PAYROLL_STATUSES');

    expect(sorted($frontend))->toBe(sorted(PayrollStatus::values()));
});

test('Permissions::MODULES module keys match frontend PERMISSION_MODULES values', function () {
    $backendModules = array_keys(Permissions::MODULES);
    $frontendModules = frontendQuotedStrings(frontendObjectBlock(PERMISSIONS_TS_PATH, 'PERMISSION_MODULES'));

    expect(sorted($frontendModules))->toBe(sorted($backendModules));
});

test('Permissions::MODULES actions match frontend MODULE_ACTIONS for every module', function () {
    $moduleActionsBlock = frontendObjectBlock(PERMISSIONS_TS_PATH, 'MODULE_ACTIONS');

    foreach (Permissions::MODULES as $module => [, $actions]) {
        // A hyphenated key like 'investor-loans' must be quoted in the TS object literal; a
        // plain identifier key like clients is not — the alternation below matches either form.
        $quotedModule = preg_quote($module, '/');
        $found = preg_match("/(?:'{$quotedModule}'|\\b{$quotedModule}):\\s*\\[(.*?)\\]/s", $moduleActionsBlock, $match);

        expect($found)->toBe(1, "Frontend MODULE_ACTIONS has no entry for the '{$module}' module.");

        $frontendActions = frontendQuotedStrings($match[1]);

        expect(sorted($frontendActions))->toBe(sorted($actions), "Action list mismatch for the '{$module}' module.");
    }
});

test('every Permissions module has a frontend MODULE_LABELS entry', function () {
    // Only checking presence, not label text equality — the label is display copy, not part of
    // the enforced contract. This is exactly the shape of drift the audit already found once
    // (the 'notes' module missing its sidebar icon because a module existed on the backend with
    // no matching frontend entry) — catching an entirely absent module here is the valuable part.
    $labelsBlock = frontendObjectBlock(PERMISSIONS_TS_PATH, 'MODULE_LABELS');

    foreach (array_keys(Permissions::MODULES) as $module) {
        $quotedModule = preg_quote($module, '/');
        $found = preg_match("/(?:'{$quotedModule}'|\\b{$quotedModule}):/", $labelsBlock);

        expect($found)->toBe(1, "Frontend MODULE_LABELS has no entry for the '{$module}' module.");
    }
});
