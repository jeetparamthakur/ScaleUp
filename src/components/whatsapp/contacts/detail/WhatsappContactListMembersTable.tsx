'use client';

import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DataTable from '@/components/data-table/DataTable';
import type {
  WhatsappContactListMember,
  WhatsappListFieldSchema,
} from '@/lib/whatsapp/lists/detail-types';

interface WhatsappContactListMemberRow extends Record<string, unknown> {
  id: string;
  phone: string;
}

function flattenMember(
  member: WhatsappContactListMember,
  fieldSchema: WhatsappListFieldSchema,
): WhatsappContactListMemberRow {
  const row: WhatsappContactListMemberRow = {
    id: member.id,
    phone: member.phone,
  };

  for (const field of fieldSchema.fields) {
    if (['firstName', 'lastName', 'company'].includes(field.key)) {
      row[field.key] =
        (member[field.key as keyof WhatsappContactListMember] as
          | string
          | null) ?? '';
    } else {
      row[field.key] = member.customFields[field.key] ?? '';
    }
  }

  return row;
}

interface WhatsappContactListMembersTableProps {
  members: WhatsappContactListMember[];
  fieldSchema: WhatsappListFieldSchema;
  isLoading: boolean;
  canDelete?: boolean;
  onDeleteMember?: (member: WhatsappContactListMember) => void;
}

export default function WhatsappContactListMembersTable({
  members,
  fieldSchema,
  isLoading,
  canDelete = false,
  onDeleteMember,
}: WhatsappContactListMembersTableProps) {
  const rows = members.map((member) => flattenMember(member, fieldSchema));

  const columnOverrides: Record<
    string,
    { label: string; render?: (row: WhatsappContactListMemberRow) => React.ReactNode }
  > = {
    phone: { label: fieldSchema.phone.label },
  };

  for (const field of fieldSchema.fields) {
    columnOverrides[field.key] = { label: field.label };
  }

  return (
    <DataTable<WhatsappContactListMemberRow>
      tableId="whatsapp-contact-list-members"
      rows={rows}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      excludeFields={['id']}
      columnOverrides={columnOverrides}
      emptyMessage="No contacts in this list yet"
      noResultsMessage="No contacts match your search."
      enableSearch={false}
      enablePagination={false}
      persistPreferences={false}
      rowActions={
        canDelete && onDeleteMember
          ? (row) => {
              const member = members.find((item) => item.id === row.id);
              if (!member) {
                return null;
              }

              return (
                <Tooltip title="Remove contact">
                  <IconButton
                    size="small"
                    aria-label="Remove contact"
                    onClick={() => onDeleteMember(member)}
                  >
                    <DeleteOutlineOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              );
            }
          : undefined
      }
    />
  );
}
