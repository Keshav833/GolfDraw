'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle, Mail, ShieldAlert, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface DrawPublishConfirmProps {
  drawId: string;
  winnerCount: number;
  rolloverAmount: number;
  onClose: () => void;
}

export default function DrawPublishConfirm({
  drawId,
  winnerCount,
  rolloverAmount,
  onClose,
}: DrawPublishConfirmProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const router = useRouter();

  const handlePublish = async () => {
    if (confirmText !== 'PUBLISH') return;

    setIsPublishing(true);
    try {
      const res = await fetch('/api/draws/publish', {
        // Note: using the existing API path
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draw_id: drawId }),
      });

      const json = await res.json();
      if (json.data?.published) {
        toast.success('Draw published successfully!');
        router.refresh();
        onClose();
      } else {
        toast.error(json.error?.message || 'Failed to publish draw');
      }
    } catch (err) {
      console.error('Publish error:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--sd)]/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[var(--bg)] rounded-[32px] shadow-[var(--raised-md)] overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-[var(--raised-sm)]">
              <AlertTriangle size={32} />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-serif">Publish this draw?</h2>
              <p className="text-sm text-[var(--text-muted)]">
                This will make the results official and permanent.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg)] shadow-[var(--inset-sm)] space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Summary of Actions
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs">
                <CheckCircle size={14} className="text-emerald-600" />
                <span>Lock results permanently</span>
              </li>
              <li className="flex items-center gap-2 text-xs">
                <Mail size={14} className="text-emerald-600" />
                <span>Notify {winnerCount} winner(s) by email</span>
              </li>
              {rolloverAmount > 0 && (
                <li className="flex items-center gap-2 text-xs text-amber-600 font-medium">
                  <AlertTriangle size={14} />
                  <span>Carry £{rolloverAmount.toFixed(2)} to next month</span>
                </li>
              )}
              <li className="flex items-center gap-2 text-xs">
                <ShieldAlert size={14} className="text-emerald-600" />
                <span>Create verification records</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-[11px] text-center text-red-600 font-bold uppercase tracking-widest">
              This cannot be undone
            </p>

            <div className="space-y-2">
              <label className="text-[10px] text-[var(--text-muted)] uppercase font-bold ml-1">
                Type PUBLISH to confirm
              </label>
              <input
                type="text"
                placeholder="PUBLISH"
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg)] shadow-[var(--inset-sm)] text-center font-bold tracking-[4px] focus:outline-none placeholder:opacity-30"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                onClick={onClose}
                className="py-3 px-6 rounded-xl bg-[var(--bg)] shadow-[var(--raised-sm)] text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
              >
                Cancel
              </button>
              <button
                disabled={confirmText !== 'PUBLISH' || isPublishing}
                onClick={handlePublish}
                className={`py-3 px-6 rounded-xl shadow-[var(--raised-sm)] text-sm font-bold transition-all ${
                  confirmText === 'PUBLISH'
                    ? 'bg-emerald-600 text-white hover:shadow-[var(--inset-sm)]'
                    : 'bg-emerald-100 text-emerald-400 opacity-50 cursor-not-allowed'
                }`}
              >
                {isPublishing ? 'Publishing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
