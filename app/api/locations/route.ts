import { NextResponse } from "next/server";
import { listAccounts } from "@/lib/google/accounts";
import { listLocations } from "@/lib/google/locations";
import { handleRouteError } from "@/lib/api-helpers";

export interface LocationListEntry {
  accountName: string;
  location: Awaited<ReturnType<typeof listLocations>>[number];
}

export async function GET() {
  try {
    const accounts = await listAccounts();
    const entries: LocationListEntry[] = [];

    for (const account of accounts) {
      const locations = await listLocations(account.name);
      for (const location of locations) {
        entries.push({ accountName: account.name, location });
      }
    }

    return NextResponse.json({ locations: entries });
  } catch (error) {
    return handleRouteError(error);
  }
}
