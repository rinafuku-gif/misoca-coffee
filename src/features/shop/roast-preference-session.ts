import { z } from "zod";
import { roastPreferencesSchema, type RoastPreferences } from "./roast-preferences";

const draftKey = "misoca-roast-preferences-v1";
const attemptKey = "misoca-roast-preferences-attempt-v1";
type StoragePort = Pick<Storage, "getItem" | "setItem">;
const attemptSchema = z.object({
  purchaseKey: z.string().regex(/^[a-f0-9]{64}$/),
  preferences: roastPreferencesSchema,
}).strict();

export function readRoastDraft(storage: StoragePort): RoastPreferences {
  const raw = storage.getItem(draftKey);
  return raw === null ? [] : roastPreferencesSchema.parse(JSON.parse(raw));
}

export function saveRoastDraft(storage: StoragePort, preferences: RoastPreferences) {
  const data = JSON.stringify(roastPreferencesSchema.parse(preferences));
  storage.setItem(draftKey, data);
  if (storage.getItem(draftKey) !== data) throw new Error("ROAST_STORAGE_UNAVAILABLE");
}

export function saveRoastAttempt(storage: StoragePort, purchaseKey: string, preferences: RoastPreferences) {
  // Initial checkout stores the snapshot before publishing the attempt. Older site
  // builds can still read the original cart and attempt keys without these fields.
  if (preferences.length === 0) return;
  const data = JSON.stringify(attemptSchema.parse({ purchaseKey, preferences }));
  storage.setItem(attemptKey, data);
  if (storage.getItem(attemptKey) !== data) throw new Error("ROAST_STORAGE_UNAVAILABLE");
}

export function readRoastAttempt(storage: StoragePort, purchaseKey: string): RoastPreferences {
  const raw = storage.getItem(attemptKey);
  if (raw === null) return [];
  const saved = attemptSchema.parse(JSON.parse(raw));
  return saved.purchaseKey === purchaseKey ? saved.preferences : [];
}
