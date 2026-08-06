<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreTicketRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $user = $this->user();
        $unitId = $user?->unit_id;

        return [
            'title' => ['required', 'string', 'max:255'],
            'project_id' => $unitId
                ? ['required', 'integer', 'exists:projects,id']
                : ['nullable', 'integer', 'exists:projects,id'],
            'priority' => ['nullable', 'in:low,medium,high'],
            'description' => ['nullable', 'string'],
            'category' => ['required', 'in:IT,IPSRS'],
            'type' => ['nullable', 'string', 'max:100'],
            'attachments' => ['nullable', 'array', 'max:5'],
            'attachments.*' => [
                'file',
                'max:5120',
                'mimes:jpg,jpeg,png,gif,doc,docx,pdf,xls,xlsx,csv',
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        $unitId = $this->user()?->unit_id;

        if ($unitId) {
            $this->merge([
                'project_id' => $unitId,
            ]);
        }
    }
}
