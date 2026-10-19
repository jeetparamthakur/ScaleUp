'use client';

import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useCallback, useMemo, useState } from 'react';
import DataTable from '@/components/data-table/DataTable';
import DataTablePagination from '@/components/data-table/DataTablePagination';
import { renderProspectTableCell } from '@/components/crm/prospects/prospect-field-renderers';
import {
  getProspectListTableDefaultColumnVisible,
  getProspectTableFields,
} from '@/lib/crm/prospects/field-config';
import type { Prospect } from '@/lib/crm/prospects/types';
import { useProspectFieldSchema, useProspects } from '@/hooks/useProspects';
import {
  isImportableProspectPhone,
  resolveProspectPhoneDisplay,
} from '@/lib/whatsapp/lists/map-prospect-phone-for-display';

interface ProspectRow extends Record<string, unknown> {
  id: string;
  fullName: string;
  email: string;
}

function flattenProspect(prospect: Prospect): ProspectRow {
  return {
    ...prospect.values,
    id: prospect.id,
    fullName: prospect.fullName,
    email: prospect.email,
  };
}

interface WhatsappCrmProspectPickerProps {
  selectedIds: Set<string>;
  onSelectedIdsChange: (ids: Set<string>) => void;
}

export default function WhatsappCrmProspectPicker({
  selectedIds,
  onSelectedIdsChange,
}: WhatsappCrmProspectPickerProps) {
  const [tableSearch, setTableSearch] = useState('');
  const [autocompleteInput, setAutocompleteInput] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [prospectCache, setProspectCache] = useState<Map<string, Prospect>>(
    () => new Map(),
  );

  const { data: fieldSchema, isLoading: isSchemaLoading } =
    useProspectFieldSchema();
  const fields = useMemo(
    () => fieldSchema?.fields ?? [],
    [fieldSchema?.fields],
  );

  const { data: prospectsPage, isLoading: isProspectsLoading } = useProspects({
    q: tableSearch.trim() || undefined,
    page,
    pageSize,
  });

  const trimmedAutocomplete = autocompleteInput.trim();
  const { data: autocompletePage, isLoading: isAutocompleteLoading } =
    useProspects({
      q: trimmedAutocomplete.length >= 2 ? trimmedAutocomplete : undefined,
      page: 1,
      pageSize: 25,
    });

  const prospects = useMemo(
    () => prospectsPage?.items ?? [],
    [prospectsPage?.items],
  );
  const total = prospectsPage?.total ?? 0;
  const tableFields = getProspectTableFields(fields);
  const rows = prospects.map(flattenProspect);

  const autocompleteOptions = useMemo(() => {
    const items = autocompletePage?.items ?? [];
    return items.filter((prospect) =>
      isImportableProspectPhone(prospect.values, fields),
    );
  }, [autocompletePage?.items, fields]);

  const importableById = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const prospect of prospects) {
      map.set(
        prospect.id,
        isImportableProspectPhone(prospect.values, fields),
      );
    }
    return map;
  }, [fields, prospects]);

  const importablePageIds = useMemo(
    () =>
      rows
        .filter((row) => importableById.get(row.id) === true)
        .map((row) => row.id),
    [importableById, rows],
  );

  const allPageImportableSelected =
    importablePageIds.length > 0 &&
    importablePageIds.every((id) => selectedIds.has(id));

  const somePageImportableSelected =
    importablePageIds.some((id) => selectedIds.has(id)) &&
    !allPageImportableSelected;

  const rememberProspects = useCallback((items: Prospect[]) => {
    setProspectCache((current) => {
      const next = new Map(current);
      for (const prospect of items) {
        next.set(prospect.id, prospect);
      }
      return next;
    });
  }, []);

  function applySelection(ids: Set<string>, remembered: Prospect[]) {
    rememberProspects(remembered);
    onSelectedIdsChange(ids);
  }

  function handleToggleRow(rowId: string) {
    if (importableById.get(rowId) !== true) {
      return;
    }

    const prospect = prospects.find((item) => item.id === rowId);
    const next = new Set(selectedIds);
    if (next.has(rowId)) {
      next.delete(rowId);
    } else {
      next.add(rowId);
    }
    applySelection(next, prospect ? [prospect] : []);
  }

  function handleTogglePageSelection() {
    if (allPageImportableSelected) {
      const next = new Set(selectedIds);
      for (const id of importablePageIds) {
        next.delete(id);
      }
      onSelectedIdsChange(next);
      return;
    }

    const next = new Set(selectedIds);
    const toRemember = prospects.filter((prospect) =>
      importablePageIds.includes(prospect.id),
    );
    for (const id of importablePageIds) {
      next.add(id);
    }
    applySelection(next, toRemember);
  }

  function handleAutocompleteChange(_event: unknown, value: Prospect[]) {
    const ids = new Set(value.map((prospect) => prospect.id));
    applySelection(ids, value);
  }

  const selectedProspectsForAutocomplete = useMemo(() => {
    const result: Prospect[] = [];
    for (const id of selectedIds) {
      const cached = prospectCache.get(id);
      if (cached) {
        result.push(cached);
        continue;
      }
      const fromPage = prospects.find((prospect) => prospect.id === id);
      if (fromPage) {
        result.push(fromPage);
      }
    }
    return result;
  }, [prospectCache, prospects, selectedIds]);

  const phoneField = fields.find((field) => field.type === 'phone');

  const columnOverrides = useMemo(() => {
    const overrides: Record<
      string,
      {
        label: string;
        defaultVisible?: boolean;
        render?: (row: ProspectRow) => React.ReactNode;
      }
    > = {};

    for (const field of tableFields) {
      overrides[field.key] = {
        label: field.label.toUpperCase(),
        defaultVisible: getProspectListTableDefaultColumnVisible(field, fields),
        render: (row) => renderProspectTableCell(field, row),
      };
    }

    if (phoneField) {
      overrides[phoneField.key] = {
        label: phoneField.label.toUpperCase(),
        defaultVisible: true,
        render: (row) => {
          const prospect = prospects.find((item) => item.id === row.id);
          const display = prospect
            ? resolveProspectPhoneDisplay(prospect.values, fields)
            : '';
          const importable = importableById.get(row.id) === true;

          return (
            <Typography
              variant="body2"
              color={importable ? 'text.primary' : 'text.secondary'}
            >
              {display || '—'}
              {!importable ? ' (no valid phone)' : ''}
            </Typography>
          );
        },
      };
    }

    return overrides;
  }, [fields, importableById, phoneField, prospects, tableFields]);

  const includeFields = useMemo(() => {
    const keys = tableFields.map((field) => field.key);
    if (phoneField && !keys.includes(phoneField.key)) {
      return [phoneField.key, ...keys];
    }
    return keys;
  }, [phoneField, tableFields]);

  const isLoading = isSchemaLoading || isProspectsLoading;

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="subtitle2" className="mb-1.5 font-semibold">
          Search and select contacts
        </Typography>
        <Autocomplete
          multiple
          fullWidth
          options={autocompleteOptions}
          loading={isAutocompleteLoading}
          value={selectedProspectsForAutocomplete}
          inputValue={autocompleteInput}
          onInputChange={(_event, value) => setAutocompleteInput(value)}
          onChange={handleAutocompleteChange}
          getOptionLabel={(prospect) =>
            prospect.fullName
              ? `${prospect.fullName} (${prospect.email})`
              : prospect.email || 'Unnamed prospect'
          }
          isOptionEqualToValue={(option, value) => option.id === value.id}
          filterOptions={(items) => items}
          noOptionsText={
            trimmedAutocomplete.length >= 2
              ? 'No prospects with a valid phone found'
              : 'Type at least 2 characters to search'
          }
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label="Search CRM prospects"
              placeholder="Search by name or email…"
            />
          )}
          renderOption={(props, prospect) => {
            const phone = resolveProspectPhoneDisplay(prospect.values, fields);
            return (
              <li {...props} key={prospect.id}>
                <Stack>
                  <Typography variant="body2" className="font-medium">
                    {prospect.fullName || 'Unnamed prospect'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {prospect.email}
                    {phone ? ` · ${phone}` : ''}
                  </Typography>
                </Stack>
              </li>
            );
          }}
        />
        {selectedIds.size > 0 ? (
          <Stack direction="row" spacing={1} className="mt-2 flex-wrap">
            <Chip
              size="small"
              label={`${selectedIds.size.toLocaleString()} selected`}
              className="rounded-lg"
            />
          </Stack>
        ) : null}
      </Box>

      <Box>
        <Typography variant="subtitle2" className="mb-1.5 font-semibold">
          Or browse the CRM table
        </Typography>
        <TextField
          size="small"
          placeholder="Filter table by name or email…"
          value={tableSearch}
          onChange={(event) => {
            setTableSearch(event.target.value);
            setPage(1);
          }}
          fullWidth
          className="mb-2 rounded-xl"
        />

        <Typography variant="caption" color="text.secondary" className="mb-2 block">
          Only prospects with a valid phone number can be selected. Use the
          checkboxes on each page or the search field above.
        </Typography>

        <Box className="overflow-hidden rounded-2xl border border-surface-border">
          <DataTable<ProspectRow>
            tableId="whatsapp-crm-prospect-picker"
            rows={rows}
            getRowId={(row) => row.id}
            excludeFields={['id']}
            includeFields={includeFields}
            columnOverrides={columnOverrides}
            isLoading={isLoading}
            emptyMessage="No prospects found."
            noResultsMessage="No prospects match your search."
            enableSearch={false}
            enablePagination={false}
            persistPreferences={false}
            rowSelection={{
              selectedIds,
              onToggleRow: handleToggleRow,
              isRowSelectable: (rowId) => importableById.get(rowId) === true,
              headerCheckbox: {
                checked: allPageImportableSelected,
                indeterminate: somePageImportableSelected,
                onChange: handleTogglePageSelection,
              },
            }}
          />
          <Box className="border-t border-border/60">
            <DataTablePagination
              page={page - 1}
              pageSize={pageSize}
              totalRows={total}
              onPageChange={(nextPage) => setPage(nextPage + 1)}
              onPageSizeChange={(nextSize) => {
                setPageSize(nextSize);
                setPage(1);
              }}
            />
          </Box>
        </Box>
      </Box>
    </Stack>
  );
}
