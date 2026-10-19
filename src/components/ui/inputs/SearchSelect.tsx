'use client';

import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import * as Popover from '@radix-ui/react-popover';
import { useId, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import Field from './Field';
import {
  controlShellClass,
  controlShellDataAttrs,
  listOptionClass,
  popoverContentClass,
} from './controlStyles';

export interface SearchSelectOption {
  value: string;
  label: string;
  keywords?: string;
}

export interface SearchSelectProps {
  id?: string;
  label?: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchSelectOption[];
  placeholder?: string;
  /** @deprecated Search runs in the main field; use `placeholder` instead. */
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  filterOption?: (option: SearchSelectOption, query: string) => boolean;
  renderOption?: (option: SearchSelectOption) => React.ReactNode;
}

function defaultFilter(option: SearchSelectOption, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  const haystack = `${option.label} ${option.value} ${option.keywords ?? ''}`.toLowerCase();
  return haystack.includes(normalized);
}

export default function SearchSelect({
  id: idProp,
  label,
  description,
  value,
  onChange,
  options,
  placeholder = 'Select…',
  searchPlaceholder,
  disabled = false,
  error,
  helperText,
  required,
  className,
  filterOption = defaultFilter,
  renderOption,
}: SearchSelectProps) {
  const generatedId = useId();
  const fieldId = idProp ?? generatedId;
  const listboxId = `${fieldId}-listbox`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [highlighted, setHighlighted] = useState(0);

  const inputPlaceholder = searchPlaceholder ?? placeholder;

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const selectedLabel = selectedOption?.label ?? '';
  const inputText = open ? draftText : selectedLabel;

  const filtered = useMemo(
    () => options.filter((option) => filterOption(option, draftText)),
    [draftText, filterOption, options],
  );

  const activeIndex =
    filtered.length === 0 ? 0 : Math.min(highlighted, filtered.length - 1);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setDraftText(selectedLabel);
      setHighlighted(0);
      return;
    }

    setHighlighted(0);
  }

  function openForEditing() {
    if (!open) {
      setDraftText(selectedLabel);
    }
    setOpen(true);
  }

  function selectOption(option: SearchSelectOption) {
    onChange(option.value);
    setDraftText(option.label);
    setOpen(false);
    setHighlighted(0);
  }

  function handleClear() {
    onChange('');
    setDraftText('');
    setHighlighted(0);
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setHighlighted((current) =>
        filtered.length === 0 ? 0 : Math.min(current + 1, filtered.length - 1),
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setHighlighted((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === 'Enter' && open && filtered[activeIndex]) {
      event.preventDefault();
      selectOption(filtered[activeIndex]);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }
  }

  const invalid = Boolean(error);

  const control = (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Anchor asChild>
        <div
          className={cn(
            controlShellClass(invalid, disabled, 'gap-0'),
            className,
          )}
          {...controlShellDataAttrs(invalid, disabled)}
        >
          <input
            ref={inputRef}
            id={fieldId}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              open && filtered[activeIndex]
                ? `${listboxId}-opt-${filtered[activeIndex].value}`
                : undefined
            }
            disabled={disabled}
            value={inputText}
            placeholder={inputPlaceholder}
            autoComplete="off"
            spellCheck={false}
            className="control-field-input min-w-0 text-left"
            onFocus={openForEditing}
            onChange={(event) => {
              setDraftText(event.target.value);
              setHighlighted(0);
              openForEditing();
            }}
            onKeyDown={onInputKeyDown}
          />
          <span className="flex shrink-0 items-center pr-1">
            {value && !disabled ? (
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] hover:text-[var(--foreground)]"
                aria-label="Clear selection"
                tabIndex={-1}
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleClear}
              >
                <CloseOutlinedIcon sx={{ fontSize: 18 }} />
              </button>
            ) : null}
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] hover:text-[var(--foreground)]"
              aria-label={open ? 'Close options' : 'Open options'}
              tabIndex={-1}
              disabled={disabled}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setOpen((current) => !current)}
            >
              <UnfoldMoreOutlinedIcon sx={{ fontSize: 20 }} />
            </button>
          </span>
        </div>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          className={cn(popoverContentClass, 'p-1.5')}
          align="start"
          sideOffset={6}
          collisionPadding={16}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onInteractOutside={(event) => {
            if (inputRef.current?.contains(event.target as Node)) {
              event.preventDefault();
            }
          }}
        >
          <ul
            id={listboxId}
            role="listbox"
            className="max-h-60 overflow-y-auto"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted">No matches</li>
            ) : (
              filtered.map((option, index) => (
                <li
                  key={option.value}
                  id={`${listboxId}-opt-${option.value}`}
                  role="option"
                  aria-selected={option.value === value}
                  data-highlighted={index === activeIndex}
                  data-selected={option.value === value}
                  className={listOptionClass}
                  onMouseEnter={() => setHighlighted(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectOption(option)}
                >
                  {renderOption ? renderOption(option) : option.label}
                </li>
              ))
            )}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );

  if (!label && !error && !helperText && !description) {
    return control;
  }

  return (
    <Field
      id={fieldId}
      label={label}
      description={description}
      error={error}
      required={required}
    >
      {control}
      {helperText && !error ? (
        <p className="text-xs text-muted">{helperText}</p>
      ) : null}
    </Field>
  );
}
