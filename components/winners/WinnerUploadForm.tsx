'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { LoadingButton } from '@/components/ui/LoadingButton';

const raisedSm =
  '3px 3px 8px var(--dashboard-shadow-dark), -3px -3px 8px var(--dashboard-shadow-light)';
const raisedXs =
  '2px 2px 5px var(--dashboard-shadow-dark), -2px -2px 5px var(--dashboard-shadow-light)';
const insetShadow =
  'inset 3px 3px 7px var(--dashboard-shadow-dark), inset -3px -3px 7px var(--dashboard-shadow-light)';

export function WinnerUploadForm({
  drawResultId,
  drawMonth,
  drawNumber,
  matchCategory,
  prizeAmount,
  existingStatus,
}: {
  drawResultId: string;
  drawMonth: string;
  drawNumber: number;
  matchCategory: string;
  prizeAmount: number;
  existingStatus?: 'pending' | 'approved' | 'rejected';
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(existingStatus ?? null);

  const previewUrl = useMemo(() => {
    if (!file || !file.type.startsWith('image/')) {
      return null;
    }

    return URL.createObjectURL(file);
  }, [file]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    try {
      const urlRes = await fetch(
        `/api/winners/upload-url?draw_result_id=${drawResultId}`
      );
      const urlJson = await urlRes.json();

      if (!urlRes.ok || !urlJson.data) {
        throw new Error(
          urlJson.error?.message ?? 'Could not create upload URL'
        );
      }

      const uploadRes = await fetch(urlJson.data.upload_url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadRes.ok) {
        throw new Error('Upload failed');
      }

      const confirmRes = await fetch('/api/winners/confirm-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draw_result_id: drawResultId,
          file_path: urlJson.data.file_path,
        }),
      });
      const confirmJson = await confirmRes.json();

      if (!confirmRes.ok) {
        throw new Error(confirmJson.error?.message ?? 'Confirmation failed');
      }

      setStatus('pending');
      toast.success(
        'Proof uploaded! We will review it within 2 business days.'
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (status === 'pending' || status === 'approved') {
    return (
      <div
        className="rounded-[20px] bg-[var(--dashboard-bg)] p-8 text-center"
        style={{ boxShadow: raisedSm }}
      >
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--dashboard-green-700)] text-2xl text-white"
          style={{ boxShadow: raisedXs }}
        >
          ✓
        </div>
        <h2 className="mt-5 text-2xl font-semibold text-[#2a3a2a]">
          Proof received!
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-[#6a7a6a]">
          We&apos;ll review your scorecard within 2 business days. You&apos;ll
          receive an email when it has been processed.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-[14px] px-5 py-3 text-sm font-medium text-[#2a3a2a]"
          style={{ background: 'var(--dashboard-bg)', boxShadow: raisedXs }}
        >
          Back to dashboard →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section
        className="rounded-[20px] bg-[var(--dashboard-bg)] p-6 sm:p-8"
        style={{ boxShadow: raisedSm }}
      >
        <div className="flex items-start gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-[#f0c040] text-2xl text-[#5d4700]"
            style={{ boxShadow: raisedXs }}
          >
            🏆
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-[#2a3a2a]">
              You won £{prizeAmount.toFixed(2)}!
            </h1>
            <p className="mt-1 text-sm text-[#1a5e38]">
              {matchCategory} in the {drawMonth} draw
            </p>
            <p className="mt-2 text-sm text-[#6a7a6a]">
              Upload your scorecard screenshot to claim your prize.
            </p>
          </div>
        </div>
      </section>

      <section
        className="rounded-[20px] bg-[var(--dashboard-bg)] p-6"
        style={{ boxShadow: raisedSm }}
      >
        <h2 className="text-lg font-semibold text-[#2a3a2a]">What to upload</h2>
        <ul className="mt-4 space-y-2 text-sm text-[#6a7a6a]">
          <li>- A clear photo or screenshot of your official scorecard</li>
          <li>
            - Must show your name, the date, and the score of {drawNumber}
          </li>
          <li>- Accepted formats: JPG, PNG, WebP, PDF</li>
          <li>- Max file size: 10MB</li>
        </ul>
      </section>

      <section
        className="rounded-[20px] bg-[var(--dashboard-bg)] p-6"
        style={{ boxShadow: raisedSm }}
      >
        <label
          className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[20px] px-6 py-8 text-center"
          style={{ boxShadow: insetShadow }}
        >
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <div className="text-lg font-semibold text-[#2a3a2a]">
            Click to select or drag and drop
          </div>
          <p className="mt-2 text-sm text-[#6a7a6a]">
            Private upload. Your file goes directly to secure storage.
          </p>
          {file ? (
            <div
              className="mt-6 w-full max-w-md rounded-[16px] bg-[var(--dashboard-bg)] p-4 text-left"
              style={{ boxShadow: raisedXs }}
            >
              <p className="font-medium text-[#2a3a2a]">{file.name}</p>
              <p className="mt-1 text-xs text-[#6a7a6a]">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          ) : null}
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Selected proof preview"
              width={300}
              height={200}
              unoptimized
              className="mt-6 max-h-64 w-auto rounded-[18px] object-contain"
            />
          ) : null}
        </label>
      </section>

      <LoadingButton
        variant="green"
        loading={uploading}
        disabled={!file}
        fullWidth
        onClick={handleUpload}
        style={{
          minWidth: 180,
          borderRadius: 14,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        Upload proof
      </LoadingButton>
    </div>
  );
}
