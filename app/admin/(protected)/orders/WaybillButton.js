'use client';

import { useActionState } from 'react';
import { createEcontWaybill } from './actions';

export default function WaybillButton({ orderId }) {
  const [state, formAction, pending] = useActionState(
    createEcontWaybill.bind(null, orderId),
    null
  );

  return (
    <form action={formAction}>
      {state?.error && (
        <p className="text-sm text-red-600 mb-2 bg-red-50 border border-red-200 rounded px-3 py-2">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? 'Creating waybill…' : 'Create Econt Waybill'}
      </button>
    </form>
  );
}
