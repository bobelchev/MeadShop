'use server';

import { updateStatus } from '@/lib/adminActions';

const VALID_STATUSES = ['new', 'contacted', 'closed'];

export async function updateWholesaleStatus(inquiryId, formData) {
  updateStatus('wholesale_inquiries', VALID_STATUSES, '/admin/wholesale', inquiryId, formData);
}
