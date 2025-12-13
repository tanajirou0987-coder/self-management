import type { DashboardSnapshot } from "@/types/dashboard";
import { getSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/client";

const STORAGE_PREFIX = "self-mgmt:snapshot";

const isBrowser = () => typeof window !== "undefined";

const getLocalKey = (date: string) => `${STORAGE_PREFIX}:${date}`;

const loadFromLocalStorage = (date: string) => {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(getLocalKey(date));
    return raw ? (JSON.parse(raw) as DashboardSnapshot) : null;
  } catch (error) {
    console.warn("Failed to parse local snapshot", error);
    return null;
  }
};

const saveToLocalStorage = (snapshot: DashboardSnapshot) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(
      getLocalKey(snapshot.date),
      JSON.stringify(snapshot),
    );
  } catch (error) {
    console.warn("Failed to persist snapshot locally", error);
  }
};

const loadFromSupabase = async (date: string) => {
  if (!hasSupabaseConfig) return null;
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("dashboard_snapshots")
      .select("payload")
      .eq("date", date)
      .maybeSingle();

    if (error) throw error;
    return data?.payload as DashboardSnapshot | null;
  } catch (error) {
    console.error("Failed to load snapshot from Supabase", error);
    return null;
  }
};

const saveToSupabase = async (snapshot: DashboardSnapshot) => {
  if (!hasSupabaseConfig) return;
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("dashboard_snapshots").upsert({
      date: snapshot.date,
      payload: snapshot,
    });
    if (error) throw error;
  } catch (error) {
    console.error("Failed to save snapshot to Supabase", error);
    throw error;
  }
};

const deleteFromLocalStorage = (date: string) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(getLocalKey(date));
  } catch (error) {
    console.warn("Failed to delete local snapshot", error);
  }
};

const deleteFromSupabase = async (date: string) => {
  if (!hasSupabaseConfig) return;
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("dashboard_snapshots")
      .delete()
      .eq("date", date);
    if (error) throw error;
  } catch (error) {
    console.error("Failed to delete snapshot from Supabase", error);
    throw error;
  }
};

export const loadSnapshot = async (
  date: string,
): Promise<DashboardSnapshot | null> => {
  const fromSupabase = await loadFromSupabase(date);
  if (fromSupabase) {
    if (isBrowser()) saveToLocalStorage(fromSupabase);
    return fromSupabase;
  }

  return loadFromLocalStorage(date);
};

export const persistSnapshot = async (snapshot: DashboardSnapshot) => {
  saveToLocalStorage(snapshot);
  try {
    await saveToSupabase(snapshot);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const deleteSnapshot = async (date: string) => {
  deleteFromLocalStorage(date);
  try {
    await deleteFromSupabase(date);
  } catch (error) {
    return { success: false, error };
  }
  return { success: true };
};
