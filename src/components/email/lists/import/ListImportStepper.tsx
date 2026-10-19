'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { LIST_IMPORT_WIZARD_STEPS } from '@/lib/schemas/contact-list-import';

interface ListImportStepperProps {
  activeStepIndex: number;
  compact?: boolean;
}

const CIRCLE_SIZE_DEFAULT = 36;
const LINE_HEIGHT_DEFAULT = 3;
const CIRCLE_SIZE_COMPACT = 26;
const LINE_HEIGHT_COMPACT = 2;

export default function ListImportStepper({
  activeStepIndex,
  compact = false,
}: ListImportStepperProps) {
  const circleSize = compact ? CIRCLE_SIZE_COMPACT : CIRCLE_SIZE_DEFAULT;
  const circleRadius = circleSize / 2;
  const lineHeight = compact ? LINE_HEIGHT_COMPACT : LINE_HEIGHT_DEFAULT;
  return (
    <Box
      component="nav"
      aria-label="List import progress"
      className="w-full"
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          width: '100%',
        }}
      >
        {LIST_IMPORT_WIZARD_STEPS.map((step, index) => {
          const isActive = index === activeStepIndex;
          const isComplete = index < activeStepIndex;
          const isReached = index <= activeStepIndex;
          const isLast = index === LIST_IMPORT_WIZARD_STEPS.length - 1;
          const isLineFilled = index < activeStepIndex;

          return (
            <Box
              key={step.id}
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
                    top: circleRadius - lineHeight / 2,
                    left: `calc(50% + ${circleRadius}px)`,
                    width: `calc(100% - ${circleSize}px)`,
                    height: lineHeight,
                    zIndex: 0,
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 9999,
                      backgroundColor:
                        'color-mix(in srgb, var(--foreground) 14%, transparent)',
                    }}
                  />
                  <Box
                    className="bg-foreground"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      width: isLineFilled ? '100%' : '0%',
                      borderRadius: 9999,
                      transition: 'width 300ms ease-out',
                    }}
                  />
                </Box>
              ) : null}

              <Box
                className={`relative z-10 flex items-center justify-center rounded-full font-bold transition-colors duration-300 ${
                  compact ? 'text-xs' : 'text-sm'
                } ${
                  isReached
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-text-secondary'
                }`}
                sx={{
                  width: circleSize,
                  height: circleSize,
                  flexShrink: 0,
                  backgroundColor: isReached ? undefined : 'var(--background)',
                  border: isReached
                    ? 'none'
                    : '2px solid color-mix(in srgb, var(--foreground) 22%, transparent)',
                }}
              >
                {index + 1}
              </Box>

              <Typography
                variant="caption"
                className={`px-0.5 text-center leading-tight ${
                  compact ? 'mt-1 text-[0.65rem]' : 'mt-1.5'
                } ${
                  isActive
                    ? 'font-bold text-foreground'
                    : isComplete
                      ? 'font-semibold text-foreground'
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
