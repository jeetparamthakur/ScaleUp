import { whatsappContactListsService } from '@/lib/api/services/whatsapp-contact-lists.service';

function sanitizeFilename(name: string): string {
  const base = name.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
  return base ? `${base}.pdf` : 'whatsapp-list.pdf';
}

export async function downloadWhatsappListPdf(
  listId: string,
  listName: string,
): Promise<void> {
  await whatsappContactListsService.downloadPdf(
    listId,
    sanitizeFilename(listName),
  );
}
