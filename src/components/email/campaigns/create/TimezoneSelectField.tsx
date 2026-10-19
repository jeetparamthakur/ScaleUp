'use client';

import { Controller, useFormContext } from 'react-hook-form';
import TimezoneAutocompleteField from '@/components/email/campaigns/create/TimezoneAutocompleteField';
import WizardFieldLabel from '@/components/email/campaigns/create/WizardFieldLabel';
import type { CampaignWizardFormValues } from '@/lib/schemas/campaign-wizard';

export default function TimezoneSelectField() {
  const { control } = useFormContext<CampaignWizardFormValues>();

  return (
    <>
      <WizardFieldLabel required htmlFor="timezone">
        Timezone
      </WizardFieldLabel>
      <Controller
        name="timezone"
        control={control}
        render={({ field, fieldState }) => (
          <TimezoneAutocompleteField
            id="timezone"
            value={field.value}
            onChange={field.onChange}
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message}
          />
        )}
      />
    </>
  );
}
