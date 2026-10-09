import { googleApiJson } from "@/lib/google/client";
import { MOCK_ACCOUNT_NAME } from "@/lib/google/accounts";

export interface HoursPeriod {
  openDay: string; // "MONDAY" | "TUESDAY" | ...
  openTime: string; // "09:00"
  closeDay: string;
  closeTime: string;
}

export interface Location {
  name: string; // "locations/1234567890"
  title: string;
  phoneNumbers?: { primaryPhone?: string };
  storefrontAddress?: {
    addressLines?: string[];
    locality?: string;
    administrativeArea?: string;
    postalCode?: string;
    regionCode?: string;
  };
  websiteUri?: string;
  profile?: { description?: string };
  regularHours?: { periods?: HoursPeriod[] };
}

const READ_MASK =
  "name,title,phoneNumbers,storefrontAddress,websiteUri,profile,regularHours";

const BASE_URL = "https://mybusinessbusinessinformation.googleapis.com/v1";

// Same Basic API Access requirement as accounts.ts applies here. Set
// GBP_MOCK_LOCATIONS=false once your project has that approval.
const MOCK = process.env.GBP_MOCK_LOCATIONS !== "false";

let mockLocation: Location = {
  name: "locations/mock-location-1",
  title: "Demo Coffee House",
  phoneNumbers: { primaryPhone: "+1 555-010-1234" },
  storefrontAddress: {
    addressLines: ["221B Baker Street"],
    locality: "Springfield",
    administrativeArea: "IL",
    postalCode: "62704",
    regionCode: "US",
  },
  websiteUri: "https://example.com",
  profile: {
    description: "A cozy neighborhood coffee shop serving locally roasted beans.",
  },
  regularHours: {
    periods: [
      { openDay: "MONDAY", openTime: "08:00", closeDay: "MONDAY", closeTime: "18:00" },
      { openDay: "TUESDAY", openTime: "08:00", closeDay: "TUESDAY", closeTime: "18:00" },
      { openDay: "WEDNESDAY", openTime: "08:00", closeDay: "WEDNESDAY", closeTime: "18:00" },
      { openDay: "THURSDAY", openTime: "08:00", closeDay: "THURSDAY", closeTime: "18:00" },
      { openDay: "FRIDAY", openTime: "08:00", closeDay: "FRIDAY", closeTime: "20:00" },
      { openDay: "SATURDAY", openTime: "09:00", closeDay: "SATURDAY", closeTime: "20:00" },
    ],
  },
};

export async function listLocations(accountName: string): Promise<Location[]> {
  if (MOCK) return accountName === MOCK_ACCOUNT_NAME ? [mockLocation] : [];

  const params = new URLSearchParams({ readMask: READ_MASK, pageSize: "100" });
  const data = await googleApiJson<{ locations?: Location[] }>(
    `${BASE_URL}/${accountName}/locations?${params.toString()}`
  );
  return data.locations ?? [];
}

export async function getLocation(locationName: string): Promise<Location> {
  if (MOCK) {
    if (locationName !== mockLocation.name) {
      throw new Error(`Mock location ${locationName} not found`);
    }
    return mockLocation;
  }

  const params = new URLSearchParams({ readMask: READ_MASK });
  return googleApiJson<Location>(`${BASE_URL}/${locationName}?${params.toString()}`);
}

export async function updateLocation(
  locationName: string,
  patch: Partial<Location>,
  updateMask: string[]
): Promise<Location> {
  if (MOCK) {
    if (locationName !== mockLocation.name) {
      throw new Error(`Mock location ${locationName} not found`);
    }
    mockLocation = { ...mockLocation, ...patch };
    return mockLocation;
  }

  const params = new URLSearchParams({ updateMask: updateMask.join(",") });
  return googleApiJson<Location>(`${BASE_URL}/${locationName}?${params.toString()}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}
