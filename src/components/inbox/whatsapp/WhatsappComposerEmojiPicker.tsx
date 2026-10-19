'use client';

import InsertEmoticonOutlinedIcon from '@mui/icons-material/InsertEmoticonOutlined';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useCallback, useState } from 'react';
import { WHATSAPP_COMPOSER_EMOJI_CATEGORIES } from '@/lib/inbox/whatsapp-composer-emojis';

interface WhatsappComposerEmojiPickerProps {
  disabled?: boolean;
  onPick: (emoji: string) => void;
}

export default function WhatsappComposerEmojiPicker({
  disabled = false,
  onPick,
}: WhatsappComposerEmojiPickerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const open = Boolean(anchorEl);

  const handleOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (disabled) {
        return;
      }
      setAnchorEl(event.currentTarget);
    },
    [disabled],
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handlePick = useCallback(
    (emoji: string) => {
      onPick(emoji);
    },
    [onPick],
  );

  const activeCategory = WHATSAPP_COMPOSER_EMOJI_CATEGORIES[categoryIndex];

  return (
    <>
      <IconButton
        aria-label="Insert emoji"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleOpen}
        disabled={disabled}
        className="!mb-0.5 !text-[#54656f]"
        size="small"
      >
        <InsertEmoticonOutlinedIcon fontSize="small" />
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{
          paper: {
            className:
              'mt-1 w-[min(100vw-2rem,320px)] overflow-hidden rounded-2xl border border-[#e9edef] shadow-lg',
          },
        }}
      >
        <Tabs
          value={categoryIndex}
          onChange={(_, value: number) => setCategoryIndex(value)}
          variant="scrollable"
          scrollButtons="auto"
          className="min-h-10 border-b border-[#e9edef] bg-[#f0f2f5] px-1"
          sx={{
            minHeight: 40,
            '& .MuiTab-root': { minHeight: 40, minWidth: 48, fontSize: '1.1rem', p: 0.5 },
          }}
        >
          {WHATSAPP_COMPOSER_EMOJI_CATEGORIES.map((category) => (
            <Tab
              key={category.id}
              label={category.emojis[0]}
              aria-label={category.label}
            />
          ))}
        </Tabs>

        <Box
          className="grid max-h-[220px] grid-cols-8 gap-0.5 overflow-y-auto bg-white p-2"
          aria-label="Emoji list"
        >
          {activeCategory.emojis.map((emoji) => (
            <button
              key={`${activeCategory.id}-${emoji}`}
              type="button"
              aria-label={`Insert ${emoji}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-xl transition-colors hover:bg-[#f0f2f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#008069]"
              onClick={() => handlePick(emoji)}
            >
              {emoji}
            </button>
          ))}
        </Box>
      </Popover>
    </>
  );
}
