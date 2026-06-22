'use server';

import { updateStatus } from '@/lib/adminActions';
import { requireAdmin } from '@/lib/adminSession';

const VALID_STATUSES = ['new', 'contacted', 'closed'];

export async function updateWholesaleStatus(inquiryId, formData) {
  await requireAdmin();
  updateStatus('wholesale_inquiries', VALID_STATUSES, '/admin/wholesale', inquiryId, formData);
}
