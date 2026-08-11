<?php

namespace App\Enums;

enum ClientType: string
{
    case Consumer = 'Consumer';
    case Corporate = 'Corporate';
    case B2B = 'B2B';
}
