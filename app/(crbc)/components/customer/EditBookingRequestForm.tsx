"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Save, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  updateBookingRequest,
  type EditableBookingFields,
} from "../../actions/booking-request";
import PhilippineAddressSelect from "../ui/PhilippineAddressSelect";

/**
 * Edit a booking request while it is still PENDING.
 *
 * The parent server page decides whether this is offered at all — it only
 * renders for status PENDING. This component re-checks on save through the
 * server action, so the rule is enforced server-side, not just in the UI.
 *
 * Only the fields below are editable. Customer identity, request channel and
 * all Freight Ops shipment/tracking data are outside this form by design.
 */

const ITEM_CATEGORIES = [
  "Parcel",
  "Documents",
  "Clothing",
  "Electronics",
  "Fragile Items",
  "Food / Perishables",
  "Books",
  "Other",
] as const;

const PACKAGE_TYPES = [
  { value: "box", label: "Box" },
  { value: "parcel", label: "Parcel" },
  { value: "document", label: "Document" },
] as const;

const inputCls =
  "w-full text-sm border border-line bg-background text-foreground placeholder-muted/70 rounded-lg px-3 py-2.5 outline-none transition-colors focus:border-accent focus:ring-4 focus:ring-accent/15";
const labelCls = "text-xs font-medium text-muted block";

const num = (v: string) => (v.trim() === "" ? null : Number(v));

export default function EditBookingRequestForm({
  requestId,
  initial,
}: {
  requestId: string;
  initial: {
    receiver_name: string;
    receiver_contact: string | null;
    receiver_province: string | null;
    receiver_city: string | null;
    receiver_barangay: string | null;
    receiver_full_address: string | null;
    package_quantity: number;
    package_type: "box" | "parcel" | "document";
    item_category: string | null;
    weight: number | null;
    dimensions: {
      length_cm: number;
      width_cm: number;
      height_cm: number;
    } | null;
    declared_value: number | null;
    airship_packaging_requested: boolean;
    remarks: string | null;
  };
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(initial.receiver_name ?? "");
  const [contact, setContact] = useState(initial.receiver_contact ?? "");
  const [province, setProvince] = useState(initial.receiver_province ?? "");
  const [city, setCity] = useState(initial.receiver_city ?? "");
  const [barangay, setBarangay] = useState(initial.receiver_barangay ?? "");
  const [fullAddress, setFullAddress] = useState(
    initial.receiver_full_address ?? ""
  );
  const [quantity, setQuantity] = useState(String(initial.package_quantity));
  const [packageType, setPackageType] = useState(initial.package_type);
  const [category, setCategory] = useState(initial.item_category ?? "Parcel");
  const [weight, setWeight] = useState(
    initial.weight != null ? String(initial.weight) : ""
  );
  const [dimLength, setDimLength] = useState(
    initial.dimensions ? String(initial.dimensions.length_cm) : ""
  );
  const [dimWidth, setDimWidth] = useState(
    initial.dimensions ? String(initial.dimensions.width_cm) : ""
  );
  const [dimHeight, setDimHeight] = useState(
    initial.dimensions ? String(initial.dimensions.height_cm) : ""
  );
  const [declaredValue, setDeclaredValue] = useState(
    initial.declared_value != null ? String(initial.declared_value) : ""
  );
  const [packaging, setPackaging] = useState(initial.airship_packaging_requested);
  const [remarks, setRemarks] = useState(initial.remarks ?? "");
  const [error, setError] = useState<string | null>(null);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-line/50"
      >
        <Pencil size={14} />
        Edit request
      </button>
    );
  }

  function handleSave() {
    setError(null);

    const payload: EditableBookingFields = {
      receiverName: name,
      receiverContact: contact || null,
      receiverProvince: province,
      receiverCity: city,
      receiverBarangay: barangay || null,
      receiverFullAddress: fullAddress || null,
      packageQuantity: Number(quantity),
      packageType,
      itemCategory: category,
      weight: num(weight),
      lengthCm: num(dimLength),
      widthCm: num(dimWidth),
      heightCm: num(dimHeight),
      declaredValue: num(declaredValue),
      airshipPackagingRequested: packaging,
      remarks: remarks || null,
    };

    startTransition(async () => {
      const res = await updateBookingRequest(requestId, payload);
      if (res.error) {
        setError(res.error);
        return;
      }
      toast.success("Request updated.");
      setEditing(false);
      // Pull the server-rendered page so Shipment History reflects the change.
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <p className="text-xs text-muted">
        This request is still pending, so these details can be changed. Once
        Airship Express accepts it, the request can no longer be edited.
      </p>

      {/* Receiver */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className={labelCls} htmlFor={`${requestId}-name`}>
            Receiver name <span className="text-accent">*</span>
          </label>
          <input
            id={`${requestId}-name`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelCls} htmlFor={`${requestId}-contact`}>
            Receiver contact
          </label>
          <input
            id={`${requestId}-contact`}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="09XX XXX XXXX"
            className={inputCls}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <span className={labelCls}>Delivery address</span>
        <PhilippineAddressSelect
          namePrefix={`edit-${requestId}`}
          initialValues={{
            province: province
              ? { name: province, regionCode: "", regionName: "" }
              : undefined,
            municipality: city
              ? { name: city, provinceName: "", regionCode: "" }
              : undefined,
            barangay: barangay
              ? {
                  name: barangay,
                  municipalityName: "",
                  provinceName: "",
                  regionCode: "",
                }
              : undefined,
          }}
          onChange={(sel) => {
            setProvince(sel.province?.name || "");
            setCity(sel.municipality?.name || "");
            setBarangay(sel.barangay?.name || "");
          }}
          required
          disabled={false}
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelCls} htmlFor={`${requestId}-address`}>
          Street address
        </label>
        <input
          id={`${requestId}-address`}
          value={fullAddress}
          onChange={(e) => setFullAddress(e.target.value)}
          className={inputCls}
        />
      </div>

      {/* Package */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <label className={labelCls} htmlFor={`${requestId}-qty`}>
            Quantity <span className="text-accent">*</span>
          </label>
          <input
            id={`${requestId}-qty`}
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className={inputCls}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelCls} htmlFor={`${requestId}-type`}>
            Package type
          </label>
          <select
            id={`${requestId}-type`}
            value={packageType}
            onChange={(e) =>
              setPackageType(e.target.value as "box" | "parcel" | "document")
            }
            className={inputCls}
          >
            {PACKAGE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className={labelCls} htmlFor={`${requestId}-cat`}>
            Item category
          </label>
          <select
            id={`${requestId}-cat`}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputCls}
          >
            {ITEM_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className={labelCls} htmlFor={`${requestId}-weight`}>
            Weight (kg) <span className="text-accent">*</span>
          </label>
          <input
            id={`${requestId}-weight`}
            type="number"
            step="0.01"
            min={0}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className={inputCls}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {(
          [
            ["Length (cm)", dimLength, setDimLength, `${requestId}-len`],
            ["Width (cm)", dimWidth, setDimWidth, `${requestId}-wid`],
            ["Height (cm)", dimHeight, setDimHeight, `${requestId}-hgt`],
          ] as const
        ).map(([label, value, setter, id]) => (
          <div key={id} className="space-y-1.5">
            <label className={labelCls} htmlFor={id}>
              {label}
            </label>
            <input
              id={id}
              type="number"
              step="0.01"
              min={0}
              value={value}
              onChange={(e) => setter(e.target.value)}
              className={inputCls}
            />
          </div>
        ))}
        <div className="space-y-1.5">
          <label className={labelCls} htmlFor={`${requestId}-declared`}>
            Declared value (₱)
          </label>
          <input
            id={`${requestId}-declared`}
            type="number"
            step="0.01"
            min={0}
            value={declaredValue}
            onChange={(e) => setDeclaredValue(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={packaging}
          onChange={(e) => setPackaging(e.target.checked)}
          className="h-4 w-4 accent-accent"
        />
        Request Airship packaging
      </label>

      <div className="space-y-1.5">
        <label className={labelCls} htmlFor={`${requestId}-remarks`}>
          Remarks
        </label>
        <textarea
          id={`${requestId}-remarks`}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={3}
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-foreground/90 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          {isPending ? "Saving..." : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setEditing(false);
          }}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-line px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-line/50 hover:text-foreground disabled:opacity-50"
        >
          <X size={14} />
          Cancel
        </button>
      </div>
    </div>
  );
}
