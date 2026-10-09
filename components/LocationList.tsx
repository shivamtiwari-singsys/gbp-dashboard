"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Location } from "@/lib/google/locations";

interface LocationEntry {
  accountName: string;
  location: Location;
}

export default function LocationList() {
  const router = useRouter();
  const [entries, setEntries] = useState<LocationEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/locations")
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/");
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? "Failed to load locations.");
        if (!cancelled) setEntries(data.locations);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
    );
  }

  if (!entries) {
    return <p className="text-sm text-zinc-500">Loading your locations…</p>;
  }

  if (entries.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No Business Profile locations found on this Google account.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {entries.map(({ location }) => {
        const locationId = location.name.split("/")[1];
        const address = location.storefrontAddress;
        return (
          <li key={location.name}>
            <Link
              href={`/dashboard/${locationId}/info`}
              className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:border-zinc-300"
            >
              <p className="font-medium">{location.title}</p>
              {address && (
                <p className="mt-1 text-sm text-zinc-500">
                  {[address.addressLines?.join(", "), address.locality, address.administrativeArea]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
