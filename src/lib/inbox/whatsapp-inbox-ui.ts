/** WhatsApp Web–inspired palette and layout tokens (light mode). */
export const waInboxUi = {
  shell:
    'grid h-full min-h-0 grid-cols-1 overflow-hidden rounded-2xl border border-[#e9edef]/90 bg-white shadow-[0_8px_30px_rgba(11,20,26,0.06)] lg:grid-cols-[minmax(300px,34%)_1fr]',
  sidebar: 'flex h-full min-h-0 flex-col overflow-hidden bg-white',
  sidebarDivider: 'border-[#e9edef]',
  panelMuted: 'bg-[#f0f2f5]',
  chatWallpaper:
    'bg-[#e5ddd5] [background-image:radial-gradient(rgba(11,20,26,0.045)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.35)_0%,transparent_45%)] [background-size:20px_20px,100%_100%]',
  headerBar:
    'z-10 flex items-center gap-2.5 border-b border-[#e9edef] bg-[#f0f2f5]/95 px-4 py-3 shadow-[0_1px_0_rgba(11,20,26,0.04)] backdrop-blur-sm',
  bubbleSent: 'ml-auto bg-[#d9fdd3] text-[#111b21] shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]',
  bubbleReceived:
    'mr-auto bg-white text-[#111b21] shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]',
  bubbleBase: 'max-w-[min(85%,420px)] px-2.5 py-1.5',
  bubbleMedia:
    'max-w-[min(85%,330px)] overflow-hidden px-1 pb-1 pt-1',
  bubbleSticker:
    'max-w-[180px] overflow-hidden bg-transparent p-0.5 shadow-none',
  dayDivider:
    'mx-auto my-3 max-w-fit rounded-lg bg-white/90 px-3 py-1 text-[12px] font-medium uppercase tracking-wide text-[#54656f] shadow-[0_1px_0.5px_rgba(11,20,26,0.08)]',
  textMuted: 'text-[#667781]',
  accent: 'text-[#008069]',
  accentBg: 'bg-[#008069]',
  listItem:
    'relative mx-2 mb-0.5 !rounded-xl !py-3 !px-3 transition-[background-color,box-shadow] duration-150 hover:!bg-[#f5f6f6]',
  listItemSelected:
    '!bg-[#f0f2f5] shadow-[inset_3px_0_0_0_#008069]',
  avatar:
    'h-12 w-12 bg-gradient-to-br from-[#dfe5e7] to-[#cfd8dc] text-base font-medium text-[#54656f] ring-1 ring-black/[0.04]',
  composerBar: 'border-t border-[#e9edef] bg-[#f0f2f5] px-4 py-3 shadow-[0_-1px_0_rgba(11,20,26,0.04)]',
  sendButton:
    '!h-10 !w-10 shadow-[0_2px_6px_rgba(0,128,105,0.35)] transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98]',
} as const;
