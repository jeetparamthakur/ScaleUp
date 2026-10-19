'use client';

import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useMemo, useRef, useState } from 'react';
import type { TimezoneOption } from '@/lib/email/campaigns/schedule-utils';
import {
  buildTimezoneOptions,
  formatTimezoneLabel,
  resolveTimezoneOption,
} from '@/lib/email/campaigns/schedule-utils';

export interface TimezoneAutocompleteFieldProps {
  id?: string;
  value: string;
  onChange: (timezone: string) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  fullWidth?: boolean;
  className?: string;
  /** @deprecated Popover search select works in modals without special handling. */
  inModal?: boolean;
}

function formatOptionLabel(option: TimezoneOption): string {
  return `${option.label} (${option.offsetLabel})`;
}

function filterTimezoneOptions(
  options: TimezoneOption[],
  query: string,
): TimezoneOption[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return options;
  }

  return options.filter(
    (option) =>
      option.value.toLowerCase().includes(normalized) ||
      option.label.toLowerCase().includes(normalized) ||
      option.offsetLabel.toLowerCase().includes(normalized),
  );
}

export default function TimezoneAutocompleteField({
  id = 'timezone',
  value,
  onChange,
  disabled = false,
  error = false,
  helperText,
  label = 'Timezone',
  fullWidth = true,
  className,
}: TimezoneAutocompleteFieldProps) {
  const theme = useTheme();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [menuWidth, setMenuWidth] = useState(320);
  const [query, setQuery] = useState('');
  const open = Boolean(anchorEl);

  const timezoneOptions = useMemo(() => buildTimezoneOptions(), []);
  const selectedOption = useMemo(
    () => resolveTimezoneOption(value, timezoneOptions),
    [timezoneOptions, value],
  );

  const filteredOptions = useMemo(
    () => filterTimezoneOptions(timezoneOptions, query),
    [query, timezoneOptions],
  );

  const resolvedHelperText =
    helperText ??
    (selectedOption
      ? `Campaign schedule uses ${formatTimezoneLabel(selectedOption.value, timezoneOptions)}.`
      : 'Search and select the timezone used for launch date and sending window.');

  const fieldValue = open
    ? query
    : selectedOption
      ? formatOptionLabel(selectedOption)
      : '';

  function ensureOpen() {
    if (disabled) {
      return;
    }

    const element = anchorRef.current;
    if (!element) {
      return;
    }

    setMenuWidth(element.clientWidth);
    setAnchorEl(element);
  }

  function openPickerForSearch() {
    ensureOpen();
    setQuery('');
  }

  function closePicker() {
    setAnchorEl(null);
    setQuery('');
  }

  function handleSelect(option: TimezoneOption) {
    onChange(option.value);
    closePicker();
  }

  const popoverZIndex = theme.zIndex.modal + 2;

  return (
    <Box ref={anchorRef} className={fullWidth ? 'w-full' : undefined}>
      <TextField
        id={id}
        label={label}
        value={fieldValue}
        onChange={(event) => {
          ensureOpen();
          setQuery(event.target.value);
        }}
        onFocus={openPickerForSearch}
        onClick={openPickerForSearch}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            closePicker();
          }
          if (event.key === 'ArrowDown' && !open) {
            event.preventDefault();
            openPickerForSearch();
          }
        }}
        fullWidth={fullWidth}
        disabled={disabled}
        error={error}
        helperText={resolvedHelperText}
        placeholder="Search timezones…"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={open ? `${id}-timezone-list` : undefined}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <SearchOutlinedIcon
                  fontSize="small"
                  className="text-muted-foreground"
                  aria-hidden
                />
                <UnfoldMoreOutlinedIcon
                  fontSize="small"
                  className="text-muted-foreground"
                  aria-hidden
                />
              </InputAdornment>
            ),
          },
        }}
        className={className ?? 'rounded-xl'}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={closePicker}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        marginThreshold={8}
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        slotProps={{
          paper: {
            id: `${id}-timezone-list`,
            role: 'listbox',
            elevation: 8,
            sx: {
              width: menuWidth,
              maxHeight: 320,
              mt: 0.5,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            },
          },
          root: {
            sx: { zIndex: popoverZIndex },
          },
        }}
      >
        <Box className="border-b border-surface-border px-3 py-2">
          <Typography variant="caption" color="text.secondary">
            {filteredOptions.length.toLocaleString()} timezone
            {filteredOptions.length === 1 ? '' : 's'}
            {query.trim() ? ' matching your search' : ''}
          </Typography>
        </Box>
        <List dense disablePadding className="overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <ListItemButton disabled>
              <ListItemText primary="No timezones match your search" />
            </ListItemButton>
          ) : (
            filteredOptions.map((option) => (
              <ListItemButton
                key={option.value}
                selected={selectedOption?.value === option.value}
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onClick={() => handleSelect(option)}
              >
                <ListItemText
                  primary={option.label}
                  secondary={option.offsetLabel}
                  slotProps={{
                    primary: { className: 'text-sm' },
                    secondary: { className: 'text-xs' },
                  }}
                />
              </ListItemButton>
            ))
          )}
        </List>
      </Popover>
    </Box>
  );
}
