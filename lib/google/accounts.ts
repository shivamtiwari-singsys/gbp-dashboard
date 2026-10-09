import { googleApiJson } from "@/lib/google/client";

export interface GoogleAccount {
  name: string; // e.g. "accounts/1234567890"
  accountName: string;
  type: string; // "PERSONAL" | "LOCATION_GROUP" | "ORGANIZATION" | ...
}

// Google requires approved "Basic API Access" for every Business Profile
// API, including this one — new projects get 0 quota and every call 429s
// until Google approves a request submitted at
// https://support.google.com/business/contact/api_default. Set
// GBP_MOCK_LOCATIONS=false once your project has that approval.
const MOCK = process.env.GBP_MOCK_LOCATIONS !== "false";

export const MOCK_ACCOUNT_NAME = "accounts/mock-account-1";

const MOCK_ACCOUNT: GoogleAccount = {
  name: MOCK_ACCOUNT_NAME,
  accountName: "Demo Business Account",
  type: "PERSONAL",
};

export async function listAccounts(): Promise<GoogleAccount[]> {
  if (MOCK) return [MOCK_ACCOUNT];

  const data = await googleApiJson<{ accounts?: GoogleAccount[] }>(
    "https://mybusinessaccountmanagement.googleapis.com/v1/accounts"
  );
  return data.accounts ?? [];
}
