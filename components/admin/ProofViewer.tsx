'use client';

import { useEffect, useState } from 'react';
import { RejectModal } from '@/components/admin/RejectModal';

const raisedSm =
  '3px 3px 8px var(--dashboard-shadow-dark), -3px -3px 8px var(--dashboard-shadow-light)';
const raisedXs =
  '2px 2px 5px var(--dashboard-shadow-dark), -2px -2px 5px var(--dashboard-shadow-light)';
const insetShadow =
  'inset 3px 3px 7px var(--dashboard-shadow-dark), inset -3px -3px 7px var(--dashboard-shadow-light)';

export function ProofViewer({
  verificationId,
  onApprove,
  onReject,
  onClose,
  winnerName,
  matchCategory,
  prizeAmount,
  drawMonth,
  drawNumber,
}: {
  verificationId: string;
  onApprove: () => void;
  onReject: (note: string) => void;
  onClose: () => void;
  winnerName: string;
  matchCategory: string;
  prizeAmount: number;
  drawMonth: string;
  drawNumber: number;
}) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReject, setShowReject] = useState(false);
  const isPdf = signedUrl?.toLowerCase().includes('.pdf') ?? false;

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await fetch(
          `/api/admin/verifications/${verificationId}/proof-url`
        );
        const json = await res.json();
        if (!res.ok || !json.data) {
          throw new Error(json.error?.message ?? 'Could not load proof');
        }
        if (active) {
          setSignedUrl(json.data.signed_url);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Could not load proof');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [verificationId]);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 backdrop-blur-sm">
        <div
          className="w-full max-w-5xl rounded-[24px] bg-[var(--dashboard-bg)] p-6"
          style={{ boxShadow: raisedSm }}
        >
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div
              className="rounded-[20px] bg-[var(--dashboard-bg)] p-4"
              style={{ boxShadow: insetShadow }}
            >
              {loading ? (
                <div className="h-[420px] animate-pulse rounded-[18px] bg-[#d9ddd9]" />
              ) : error ? (
                <div className="flex h-[420px] items-center justify-center text-center text-sm text-[#6a7a6a]">
                  Could not load proof image. Try refreshing or contact support.
                </div>
              ) : isPdf ? (
                <div className="space-y-4">
                  <iframe
                    src={signedUrl ?? ''}
                    title="Winner proof PDF"
                    className="h-[420px] w-full rounded-[18px]"
                  />
                  <a
                    href={signedUrl ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-[14px] px-4 py-2 text-sm text-[#2a3a2a]"
                    style={{
                      background: 'var(--dashboard-bg)',
                      boxShadow: raisedXs,
                    }}
                  >
                    Open PDF
                  </a>
                </div>
              ) : (
                <img
                  src={signedUrl ?? ''}
                  alt="Winner proof"
                  className="max-h-[520px] w-full rounded-[18px] object-contain"
                />
              )}
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-[#2a3a2a]">
                Review proof
              </h2>
              <div
                className="mt-5 space-y-3 rounded-[18px] bg-[var(--dashboard-bg)] p-5"
                style={{ boxShadow: insetShadow }}
              >
                <p className="text-sm text-[#6a7a6a]">Winner</p>
                <p className="font-semibold text-[#2a3a2a]">{winnerName}</p>
                <p className="text-sm text-[#6a7a6a]">Match</p>
                <p className="font-semibold text-[#2a3a2a]">{matchCategory}</p>
                <p className="text-sm text-[#6a7a6a]">Prize</p>
                <p className="font-semibold text-[#1a5e38]">
                  £{prizeAmount.toFixed(2)}
                </p>
                <p className="text-sm text-[#6a7a6a]">Draw</p>
                <p className="font-semibold text-[#2a3a2a]">
                  {drawMonth} · Draw #{drawNumber}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onApprove}
                  className="rounded-[14px] px-5 py-3 text-sm font-medium text-white"
                  style={{
                    background: 'var(--dashboard-green-700)',
                    boxShadow: raisedXs,
                  }}
                >
                  Approve ✓
                </button>
                <button
                  type="button"
                  onClick={() => setShowReject(true)}
                  className="rounded-[14px] px-5 py-3 text-sm font-medium text-white"
                  style={{ background: '#b42318', boxShadow: raisedXs }}
                >
                  Reject ✗
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-[14px] px-5 py-3 text-sm font-medium text-[#2a3a2a]"
                  style={{
                    background: 'var(--dashboard-bg)',
                    boxShadow: raisedXs,
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showReject ? (
        <RejectModal
          verificationId={verificationId}
          winnerName={winnerName}
          prizeAmount={prizeAmount}
          drawNumber={drawNumber}
          onConfirm={(note) => {
            setShowReject(false);
            onReject(note);
          }}
          onCancel={() => setShowReject(false)}
        />
      ) : null}
    </>
  );
}
