'use client';

import { useMemo } from 'react';
import { SearchSelect } from '@/components/ui/inputs';
import type {
  WhatsappTemplate,
  WhatsappTemplateType,
} from '@/lib/api/types/whatsapp-template.types';
import { useWhatsappTemplates } from '@/hooks/useWhatsappTemplates';

interface WhatsappTemplateSelectFieldProps {
  type?: WhatsappTemplateType;
  value: string;
  onChange: (templateId: string) => void;
  disabled?: boolean;
  label?: string;
  templates?: WhatsappTemplate[];
  isLoading?: boolean;
}

export default function WhatsappTemplateSelectField({
  type,
  value,
  onChange,
  disabled = false,
  label = 'Sequence template',
  templates: externalTemplates,
  isLoading: externalIsLoading,
}: WhatsappTemplateSelectFieldProps) {
  const internalQuery = useWhatsappTemplates(type ? { type } : undefined);
  const templates = externalTemplates ?? internalQuery.templates;
  const isLoading = externalIsLoading ?? internalQuery.isLoading;

  const options = useMemo(
    () =>
      templates.map((template) => ({
        value: template.id,
        label:
          template.visibility === 'private'
            ? `${template.name} (Private)`
            : template.name,
        keywords: template.name,
      })),
    [templates],
  );

  return (
    <SearchSelect
      id="whatsapp-campaign-template"
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      disabled={disabled || isLoading}
      placeholder={isLoading ? 'Loading templates…' : 'Select a template'}
      searchPlaceholder="Search templates"
      className="min-w-[14rem]"
    />
  );
}
