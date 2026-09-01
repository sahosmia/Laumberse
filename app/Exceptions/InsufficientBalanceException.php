<?php

namespace App\Exceptions;

use RuntimeException;

/** Thrown when a debit would push an Account's current_balance below zero. */
class InsufficientBalanceException extends RuntimeException
{
    public function __construct(string $accountName, float $available, float $required)
    {
        parent::__construct(sprintf(
            'Insufficient balance in "%s". Available: ৳%s, required: ৳%s.',
            $accountName,
            number_format($available, 2),
            number_format($required, 2)
        ));
    }
}
