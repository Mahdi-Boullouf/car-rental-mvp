import { useEffect, useState } from "react";
import { api } from "./api";
import type { Settings } from "../types";

// Module-level cache so the public header + hero share one request.
let cache: Settings | null = null;
const subs = new Set<(s: Settings) => void>();

export function setSettingsCache(s: Settings) {
  cache = s;
  subs.forEach((fn) => fn(s));
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(cache);
  useEffect(() => {
    subs.add(setSettings);
    if (cache) setSettings(cache);
    else api.settings().then(setSettingsCache).catch(() => {});
    return () => {
      subs.delete(setSettings);
    };
  }, []);
  return settings;
}
