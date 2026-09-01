<?php

namespace App\Http\Requests\Employees;

use App\Support\OutletContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEmployeeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // Only meaningful for a switch-capable user currently viewing "All Outlets" — see
            // App\Support\OutletContext::resolveForWrite.
            'outlet_id' => [
                Rule::requiredIf(fn () => OutletContext::isAll()),
                'nullable',
                Rule::exists('outlets', 'id')->where('status', 'active'),
            ],
            'employee_id' => 'nullable|string|max:50|unique:employees,employee_id',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'designation' => 'required|string|max:255',
            'base_salary' => 'required|numeric|min:0',
            'opening_balance' => 'nullable|numeric|min:0',
        ];
    }
}
