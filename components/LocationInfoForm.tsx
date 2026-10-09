"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Location, HoursPeriod } from "@/lib/google/locations";

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;
type Day = (typeof DAYS)[number];

interface DayHours {
  closed: boolean;
  openTime: string;
  closeTime: string;
}

type HoursState = Record<Day, DayHours>;

const DEFAULT_HOURS: DayHours = { closed: true, openTime: "09:00", closeTime: "17:00" };

function hoursFromPeriods(periods: HoursPeriod[] | undefined): HoursState {
  const state = Object.fromEntries(DAYS.map((d) => [d, { ...DEFAULT_HOURS }])) as HoursState;
  for (const period of periods ?? []) {
    const day = period.openDay as Day;
    if (DAYS.includes(day)) {
      state[day] = { closed: false, openTime: period.openTime, closeTime: period.closeTime };
    }
  }
  return state;
}

function periodsFromHours(hours: HoursState): HoursPeriod[] {
  return DAYS.filter((d) => !hours[d].closed).map((d) => ({
    openDay: d,
    openTime: hours[d].openTime,
    closeDay: d,
    closeTime: hours[d].closeTime,
  }));
}

interface FormState {
  title: string;
  primaryPhone: string;
  websiteUri: string;
  description: string;
  addressLine: string;
  locality: string;
  administrativeArea: string;
  postalCode: string;
  hours: HoursState;
}

function formStateFromLocation(location: Location): FormState {
  return {
    title: location.title ?? "",
    primaryPhone: location.phoneNumbers?.primaryPhone ?? "",
    websiteUri: location.websiteUri ?? "",
    description: location.profile?.description ?? "",
    addressLine: location.storefrontAddress?.addressLines?.[0] ?? "",
    locality: location.storefrontAddress?.locality ?? "",
    administrativeArea: location.storefrontAddress?.administrativeArea ?? "",
    postalCode: location.storefrontAddress?.postalCode ?? "",
    hours: hoursFromPeriods(location.regularHours?.periods),
  };
}

export default function LocationInfoForm({ locationId }: { locationId: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/locations/${locationId}`)
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/");
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? "Failed to load location.");
        if (!cancelled) setForm(formStateFromLocation(data.location));
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Unknown error");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId]);

  if (loadError) {
    return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</p>;
  }
  if (!form) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const updateDay = (day: Day, patch: Partial<DayHours>) =>
    setForm((prev) =>
      prev ? { ...prev, hours: { ...prev.hours, [day]: { ...prev.hours[day], ...patch } } } : prev
    );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);

    const body: Partial<Location> = {
      title: form.title,
      phoneNumbers: { primaryPhone: form.primaryPhone },
      websiteUri: form.websiteUri,
      profile: { description: form.description },
      storefrontAddress: {
        addressLines: form.addressLine ? [form.addressLine] : [],
        locality: form.locality,
        administrativeArea: form.administrativeArea,
        postalCode: form.postalCode,
      },
      regularHours: { periods: periodsFromHours(form.hours) },
    };

    try {
      const res = await fetch(`/api/locations/${locationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to save changes.");
      setForm(formStateFromLocation(data.location));
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-5">
        <Field label="Business name">
          <input
            className="input"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
          />
        </Field>
        <Field label="Phone number">
          <input
            className="input"
            value={form.primaryPhone}
            onChange={(e) => update("primaryPhone", e.target.value)}
          />
        </Field>
        <Field label="Website">
          <input
            className="input"
            value={form.websiteUri}
            onChange={(e) => update("websiteUri", e.target.value)}
          />
        </Field>
        <Field label="Description">
          <textarea
            className="input"
            rows={3}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Street address">
            <input
              className="input"
              value={form.addressLine}
              onChange={(e) => update("addressLine", e.target.value)}
            />
          </Field>
          <Field label="City">
            <input
              className="input"
              value={form.locality}
              onChange={(e) => update("locality", e.target.value)}
            />
          </Field>
          <Field label="State / region">
            <input
              className="input"
              value={form.administrativeArea}
              onChange={(e) => update("administrativeArea", e.target.value)}
            />
          </Field>
          <Field label="Postal code">
            <input
              className="input"
              value={form.postalCode}
              onChange={(e) => update("postalCode", e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-medium text-zinc-700">Hours</h2>
        <div className="space-y-2">
          {DAYS.map((day) => (
            <div key={day} className="flex items-center gap-3 text-sm">
              <span className="w-24 shrink-0 capitalize text-zinc-600">
                {day.slice(0, 3)}
              </span>
              <label className="flex items-center gap-1.5 text-zinc-500">
                <input
                  type="checkbox"
                  checked={form.hours[day].closed}
                  onChange={(e) => updateDay(day, { closed: e.target.checked })}
                />
                Closed
              </label>
              {!form.hours[day].closed && (
                <>
                  <input
                    type="time"
                    className="input w-32"
                    value={form.hours[day].openTime}
                    onChange={(e) => updateDay(day, { openTime: e.target.value })}
                  />
                  <span className="text-zinc-400">to</span>
                  <input
                    type="time"
                    className="input w-32"
                    value={form.hours[day].closeTime}
                    onChange={(e) => updateDay(day, { closeTime: e.target.value })}
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {saveError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{saveError}</p>
      )}
      {saved && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          Saved.
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-zinc-700">{label}</span>
      {children}
    </label>
  );
}
