<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Thrown when deleting a record would orphan or cascade-delete dependent data (e.g. a client's
 * invoices). Always thrown from wherever that entity's delete operation itself lives, and always
 * caught immediately before a generic `\Throwable` catch, redirecting back with the message as a
 * flash `error` — see EmployeeController::destroy(), ExpenseCategoryController::destroy(),
 * ClientController::destroy(), CategoryController::destroy(), MaterialController::destroy(), and
 * DeleteProductAction for the current call sites.
 *
 * That "wherever the delete lives" part is deliberate, not inconsistent: most of those entities
 * have nothing beyond a relation check plus `$model->delete()`, so the guard sits directly in the
 * controller's destroy() method next to it. Product is the one exception — its delete already
 * involves extra work (removing the stored image file, wrapped in a transaction), which is why it
 * already has a dedicated Action; the guard lives there for the same reason every other guard
 * lives next to its own entity's delete logic; it isn't a special case invented for this
 * exception. A new entity's guard should follow the same rule: put it wherever that entity's
 * delete() call already lives, not in a new class created solely to hold it.
 */
class HasDependentRecordsException extends RuntimeException
{
    public function __construct(string $recordLabel, string $dependentDescription)
    {
        parent::__construct(sprintf(
            'Cannot delete %s — it has %s. Remove those first.',
            $recordLabel,
            $dependentDescription
        ));
    }
}
