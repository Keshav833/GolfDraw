'use client';

import { useEffect, useState } from 'react';
import { LoadingButton } from '@/components/ui/LoadingButton';

const raisedSm =
  '3px 3px 8px var(--dashboard-shadow-dark), -3px -3px 8px var(--dashboard-shadow-light)';
const raisedXs =
  '2px 2px 5px var(--dashboard-shadow-dark), -2px -2px 5px var(--dashboard-shadow-light)';
const insetShadow =
  'inset 3px 3px 7px var(--dashboard-shadow-dark), inset -3px -3px 7px var(--dashboard-shadow-light)';

export function RejectModal({
  verificationId,
  winnerName,
  prizeAmount,
  drawNumber,
  loading = false,
  onConfirm,
  onCancel,
}: {
  verificationId: string;
  winnerName: string;
  prizeAmount: number;
  drawNumber: number;
  loading?: boolean;
  onConfirm: (note: string) => void;
  onCancel: () => void;
}) {
  const quickReasons = [
    'Score not visible',
    "Name doesn't match",
    'Date missing',
    'Scorecard unclear',
    `Doesn't show ${drawNumber}`,
  ];
  const [note, setNote] = useState('');

  useEffect(() => {
    setNote('');
  }, [verificationId]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 px-4 backdrop-blur-sm">
      <div
        className="w-full max-w-xl rounded-[24px] bg-[var(--dashboard-bg)] p-6"
        style={{ boxShadow: raisedSm }}
      >
        <h2 className="text-2xl font-semibold text-[#2a3a2a]">
          Reject verification
        </h2>
        <p className="mt-2 text-sm text-[#6a7a6a]">
          This will notify {winnerName} and they can re-upload if needed. Prize
          amount: £{prizeAmount.toFixed(2)}.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {quickReasons.map((reason) => (
            <button
              key={reason}
              type="button"
              onClick={() => setNote(reason)}
              className="rounded-full px-4 py-2 text-sm text-[#2a3a2a]"
              style={{ background: 'var(--dashboard-bg)', boxShadow: raisedXs }}
            >
              {reason}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <label className="text-sm font-medium text-[#2a3a2a]">
            Additional note (required)
          </label>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={500}
            className="mt-2 min-h-[140px] w-full rounded-[18px] border-0 bg-[var(--dashboard-bg)] px-4 py-3 text-sm text-[#2a3a2a] outline-none"
            style={{ boxShadow: insetShadow }}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <LoadingButton
            variant="danger"
            loading={loading}
            disabled={note.trim().length < 10}
            onClick={() => onConfirm(note)}
            style={{
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 500,
              color: '#fff',
              background: '#b42318',
              boxShadow: raisedXs,
            }}
          >
            Confirm rejection
          </LoadingButton>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-[14px] px-5 py-3 text-sm font-medium text-[#2a3a2a] disabled:opacity-50"
            style={{ background: 'var(--dashboard-bg)', boxShadow: raisedXs }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
