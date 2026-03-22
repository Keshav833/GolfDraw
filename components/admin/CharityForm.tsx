'use client';

import { useState } from 'react';
import { X, Save, Heart, Shield, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Charity {
  id: string;
  name: string;
  description: string | null;
  category: string;
  country: string;
  website: string | null;
  is_active: boolean;
}

interface CharityFormProps {
  charity?: Charity | null;
  onSave: (charity: any) => void;
  onClose: () => void;
}

export default function CharityForm({
  charity,
  onSave,
  onClose,
}: CharityFormProps) {
  const [formData, setFormData] = useState({
    name: charity?.name || '',
    description: charity?.description || '',
    category: charity?.category || 'Golf & Sport',
    country: charity?.country || 'United Kingdom',
    website: charity?.website || '',
    is_active: charity?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = charity
        ? `/api/admin/charities/${charity.id}`
        : '/api/admin/charities';
      const method = charity ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.data) {
        toast.success(
          `Charity ${charity ? 'updated' : 'created'} successfully`
        );
        onSave(json.data);
      } else {
        toast.error(json.error?.message || 'Failed to save charity');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--sd)]/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-[var(--bg)] rounded-[32px] shadow-[var(--raised-md)] overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif">
              {charity ? 'Edit' : 'Add'} Charity
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[var(--bg)] shadow-[var(--raised-sm)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider ml-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg)] shadow-[var(--inset-sm)] focus:outline-none text-sm placeholder:opacity-30"
                  placeholder="Charity name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider ml-1">
                  Description ({formData.description.length}/300)
                </label>
                <textarea
                  maxLength={300}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg)] shadow-[var(--inset-sm)] focus:outline-none text-sm resize-none placeholder:opacity-30"
                  placeholder="Tell us about this charity..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider ml-1">
                    Category
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg)] shadow-[var(--inset-sm)] focus:outline-none text-sm"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option>Golf & Sport</option>
                    <option>Health & Research</option>
                    <option>Youth & Education</option>
                    <option>Environment</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider ml-1">
                    Country
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg)] shadow-[var(--inset-sm)] focus:outline-none text-sm placeholder:opacity-30"
                    placeholder="e.g. United Kingdom"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider ml-1 flex items-center gap-1.5">
                  <Globe size={12} />
                  Website URL
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg)] shadow-[var(--inset-sm)] focus:outline-none text-sm placeholder:opacity-30"
                  placeholder="https://example.org"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 group cursor-help">
                <input
                  type="checkbox"
                  id="is_active"
                  className="w-5 h-5 rounded-md border-none bg-[var(--bg)] shadow-[var(--raised-sm)] checked:bg-[var(--green-700)] focus:ring-0 transition-all cursor-pointer"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                />
                <label
                  htmlFor="is_active"
                  className="text-sm font-bold cursor-pointer"
                >
                  Set as Active
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-6 rounded-xl bg-[var(--bg)] shadow-[var(--raised-sm)] text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="py-3 px-8 rounded-xl bg-[var(--bg)] shadow-[var(--raised-sm)] hover:shadow-[var(--inset-sm)] text-[var(--green-700)] text-sm font-bold transition-all flex items-center gap-2"
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Charity'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
