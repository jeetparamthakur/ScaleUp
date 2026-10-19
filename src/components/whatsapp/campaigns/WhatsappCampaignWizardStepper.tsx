'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { WHATSAPP_CAMPAIGN_CREATE_STEPS } from '@/lib/whatsapp/campaigns/create-wizard-steps';

interface WhatsappCampaignWizardStepperProps {
  activeStepIndex: number;
}

const CIRCLE_SIZE = 32;
const CIRCLE_RADIUS = CIRCLE_SIZE / 2;
const LINE_HEIGHT = 2;

export default function WhatsappCampaignWizardStepper({
  activeStepIndex,
}: WhatsappCampaignWizardStepperProps) {
  return (
    <Box
      component="nav"
      aria-label="WhatsApp campaign creation progress"
      className="w-full"
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          width: '100%',
        }}
        role="list"
      >
        {WHATSAPP_CAMPAIGN_CREATE_STEPS.map((step, index) => {
          const isActive = index === activeStepIndex;
          const isComplete = index < activeStepIndex;
          const isLast = index === WHATSAPP_CAMPAIGN_CREATE_STEPS.length - 1;
          const isLineFilled = index < activeStepIndex;

          return (
            <Box
              key={step.id}
              role="listitem"
              aria-label={`Step ${index + 1}: ${step.label}`}
              sx={{
                position: 'relative',
                flex: '1 1 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 0,
              }}
              aria-current={isActive ? 'step' : undefined}
            >
              {!isLast ? (
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    top: CIRCLE_RADIUS - LINE_HEIGHT / 2,
                    left: `calc(50% + ${CIRCLE_RADIUS}px)`,
                    width: `calc(100% - ${CIRCLE_SIZE}px)`,
                    height: LINE_HEIGHT,
                    zIndex: 0,
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 9999,
                      backgroundColor: 'var(--surface-border)',
                    }}
                  />
                  <Box
                    className="bg-primary"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      width: isLineFilled ? '100%' : '0%',
                      borderRadius: 9999,
                      transition: 'width 300ms ease-out',
                      '@media (prefers-reduced-motion: reduce)': {
                        transition: 'none',
                      },
                    }}
                  />
                </Box>
              ) : null}

              <Box
                className={`relative z-10 flex items-center justify-center rounded-full text-xs font-bold transition-colors duration-300 ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : isComplete
                      ? 'bg-primary/85 text-white'
                      : 'border-2 border-surface-border bg-background text-text-secondary'
                }`}
                sx={{
                  width: CIRCLE_SIZE,
                  height: CIRCLE_SIZE,
                  flexShrink: 0,
                }}
              >
                {index + 1}
              </Box>

              <Typography
                variant="caption"
                className={`mt-1.5 hidden px-0.5 text-center leading-snug sm:block ${
                  isActive
                    ? 'font-bold text-foreground'
                    : isComplete
                      ? 'font-semibold text-foreground/80'
                      : 'text-text-secondary'
                }`}
              >
                {step.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
