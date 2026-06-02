"use client";

import { useTransition } from "react";
import { clearRepairOrder, unclearRepairOrder, undoPaid } from "../actions";

/**
 * Action buttons shown on a PAID repair order: undo the paid status (with
 * confirmation, since it removes recorded payments) and clear / unclear the
 * ticket from the active list.
 */
export function PaidActions({
  id,
  cleared,
}: {
  id: string;
  cleared: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleUndo() {
    if (
      !window.confirm(
        "Undo Paid? This marks the ticket as unpaid (the full balance will be owed again) and removes any recorded payments on it.",
      )
    ) {
      return;
    }
    startTransition(() => undoPaid(id));
  }

  return (
    <>
      <button
        type="button"
        onClick={handleUndo}
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-md font-medium h-9 px-4 text-sm bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
      >
        Undo Paid
      </button>
      {cleared ? (
        <button
          type="button"
          onClick={() => startTransition(() => unclearRepairOrder(id))}
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-md font-medium h-9 px-4 text-sm bg-white text-zinc-700 border border-zinc-300 hover:border-zinc-400 disabled:opacity-50"
        >
          Unclear
        </button>
      ) : (
        <button
          type="button"
          onClick={() => startTransition(() => clearRepairOrder(id))}
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-md font-medium h-9 px-4 text-sm bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          Clear Ticket
        </button>
      )}
    </>
  );
}
