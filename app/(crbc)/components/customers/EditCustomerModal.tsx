"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X, Loader2, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { staffUpdateCustomer } from "../../actions/customer";


export type EditableCustomer = {
  uuid: string;
  customerId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  province: string | null;
  city: string | null;
  barangay: string | null;
  fullAddress: string | null;
};

const inputCls =
  "w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent disabled:opacity-50";

export default function EditCustomerModal({
  customer,
}: {
  customer: EditableCustomer;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState(customer.fullName);
  const [email, setEmail] = useState(customer.email ?? "");
  const [phone, setPhone] = useState(customer.phone ?? "");
  const [province, setProvince] = useState(customer.province ?? "");
  const [city, setCity] = useState(customer.city ?? "");
  const [barangay, setBarangay] = useState(customer.barangay ?? "");
  const [fullAddress, setFullAddress] = useState(customer.fullAddress ?? "");

  function close() {
    setError(null);
    setOpen(false);
  }

  function save() {
    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const res = await staffUpdateCustomer({
        customerUuid: customer.uuid,
        fullName,
        email: email || null,
        phone: phone || null,
        province: province || null,
        city: city || null,
        barangay: barangay || null,
        fullAddress: fullAddress || null,
      });

      if (!res.success) {
        setError(res.error ?? "Failed to save.");
        return;
      }

      toast.success("Customer updated.");
      close();
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-background px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-line/50"
      >
        <Pencil size={14} />
        Edit
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Edit ${customer.customerId}`}
      onClick={() => !isPending && close()}
    >
      <div
        className="my-8 w-full max-w-lg overflow-hidden rounded-xl border border-line bg-background"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-foreground text-sm font-semibold">
              Edit Customer
            </h2>
            <p className="text-muted mt-0.5 font-mono text-xs">
              {customer.customerId}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            disabled={isPending}
            className="text-muted hover:text-foreground p-1 disabled:opacity-50"
          >
            <X size={15} />
          </button>
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto px-5 py-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted" htmlFor="ec-name">
              Full Name <span className="text-accent">*</span>
            </label>
            <input
              id="ec-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted" htmlFor="ec-email">
                Email
              </label>
              <input
                id="ec-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted" htmlFor="ec-phone">
                Phone
              </label>
              <input
                id="ec-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09XX XXX XXXX"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted" htmlFor="ec-province">
                Province
              </label>
              <input
                id="ec-province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted" htmlFor="ec-city">
                City
              </label>
              <input
                id="ec-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted" htmlFor="ec-brgy">
                Barangay
              </label>
              <input
                id="ec-brgy"
                value={barangay}
                onChange={(e) => setBarangay(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted" htmlFor="ec-addr">
              Street Address
            </label>
            <input
              id="ec-addr"
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Immutable fields, shown read-only so the boundary is visible. */}
          <div className="rounded-lg border border-dashed border-line bg-background/50 px-3 py-2.5">
            <p className="text-muted mb-1 flex items-center gap-1.5 text-[11px] font-medium">
              <ShieldCheck size={12} />
              System-managed — not editable
            </p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Customer ID</dt>
                <dd className="text-foreground font-mono">{customer.customerId}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Created</dt>
                <dd className="text-foreground">managed by the system</dd>
              </div>
            </dl>
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-5 py-3.5">
          <button
            type="button"
            onClick={close}
            disabled={isPending}
            className="rounded-lg border border-line px-3.5 py-2 text-sm text-muted transition-colors hover:bg-line/50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-foreground/90 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}