import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, Transition } from '@headlessui/react';
import { Check as CheckIcon, ChevronsUpDown as ChevronsUpDownIcon } from 'lucide-react';
import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface Option {
    label: string;
    value: string | number;
}

interface SearchableSelectProps {
    options: Option[];
    value?: string | number | null;
    onChange: (value: string | number) => void;
    placeholder?: string;
    className?: string;
    error?: string;
    disabled?: boolean;
}

export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Select option...',
    className,
    error,
    disabled = false,
}: SearchableSelectProps) {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredOptions =
        query === ''
            ? options
            : options.filter((option) =>
                  option.label
                      .toLowerCase()
                      .replace(/\s+/g, '')
                      .includes(query.toLowerCase().replace(/\s+/g, '')),
              );

    const handleChange = (val: string | number | null) => {
        // Headless UI's Combobox always types onChange as `(value: T | null) => void` even in
        // single-select mode; this component has no "clear" affordance, so null never actually
        // fires in practice, but we guard it here to keep the public onChange contract non-null.
        if (val === null) return;
        onChange(val);
        if (inputRef.current) {
            inputRef.current.blur();
        }
    };

    const handleFocus = () => {
        // On focus the browser auto-selects the full displayed text, so a single
        // Backspace would wipe out the whole value instead of one character.
        // Collapse the selection to the end right after focus to prevent that.
        requestAnimationFrame(() => {
            const el = inputRef.current;
            if (el) {
                const len = el.value.length;
                el.setSelectionRange(len, len);
            }
        });
    };

    return (
        <div className={cn('w-full', className)}>
            <Combobox value={value} onChange={handleChange} disabled={disabled} onClose={() => setQuery('')} immediate>
                <div className="relative mt-1">
                    <div className="relative w-full cursor-default overflow-hidden rounded-md border border-input bg-background text-left focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 sm:text-sm">
                        <ComboboxInput
                            ref={inputRef}
                            className={cn(
                                'w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-foreground bg-transparent focus:ring-0 focus:outline-none',
                                disabled && 'cursor-not-allowed opacity-50',
                            )}
                            displayValue={(val: string | number) => options.find((o) => o.value == val)?.label || ''}
                            onChange={(event) => setQuery(event.target.value)}
                            onFocus={handleFocus}
                            placeholder={placeholder}
                        />
                        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronsUpDownIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        </ComboboxButton>
                    </div>
                    <Transition
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <ComboboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-neutral-900 py-1 text-base shadow-lg focus:outline-none sm:text-sm border border-neutral-200 dark:border-neutral-800">
                            {filteredOptions.length === 0 && query !== '' ? (
                                <div className="relative cursor-default select-none py-2 px-4 text-neutral-500 dark:text-neutral-400">
                                    Nothing found.
                                </div>
                            ) : (
                                filteredOptions.map((option) => (
                                    <ComboboxOption
                                        key={option.value}
                                        className={({ focus }) =>
                                            cn(
                                                'relative cursor-default select-none py-2 pl-10 pr-4 transition-colors',
                                                focus ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100' : 'text-neutral-900 dark:text-neutral-100',
                                            )
                                        }
                                        value={option.value}
                                    >
                                        {({ selected, focus }) => (
                                            <>
                                                <span className={cn('block truncate', selected ? 'font-medium' : 'font-normal')}>
                                                    {option.label}
                                                </span>
                                                {selected ? (
                                                    <span
                                                        className={cn(
                                                            'absolute inset-y-0 left-0 flex items-center pl-3',
                                                            focus ? 'text-neutral-900 dark:text-neutral-100' : 'text-primary',
                                                        )}
                                                    >
                                                        <CheckIcon className="h-4 w-4" aria-hidden="true" />
                                                    </span>
                                                ) : null}
                                            </>
                                        )}
                                    </ComboboxOption>
                                ))
                            )}
                        </ComboboxOptions>
                    </Transition>
                </div>
            </Combobox>
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        </div>
    );
}
