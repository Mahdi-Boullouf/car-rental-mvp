import type { Agency, Booking, Car, Me, PublicAgency, Sale, Settings, User } from "../types";

// VITE_API_URL may be a full URL or a bare host (Render injects the host);
// normalize to an https origin. Empty in dev -> Vite proxy handles /api.
const RAW = ((import.meta.env.VITE_API_URL as string) || "").trim().replace(/\/$/, "");
const ORIGIN = RAW && !/^https?:\/\//i.test(RAW) ? `https://${RAW}` : RAW;
const BASE = ORIGIN + "/api";

const TOKEN_KEY = "mc_token";
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string | null) =>
  t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);

/** Resolve a stored /uploads/... path to a full URL. */
export const imgUrl = (p?: string) => (p ? ORIGIN + p : "");

async function req<T>(path: string, opts: Omit<RequestInit, "body"> & { body?: any } = {}): Promise<T> {
  const isForm = opts.body instanceof FormData;
  const headers: Record<string, string> = { ...(opts.headers as any) };
  if (opts.body && !isForm) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(BASE + path, {
    ...opts,
    headers,
    body: opts.body && !isForm ? JSON.stringify(opts.body) : opts.body,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.message || "حدث خطأ، حاول مرة أخرى");
  }
  return json.data as T;
}

export const api = {
  login: (email: string, password: string) =>
    req<{ token: string; user: User }>("/auth/login", { method: "POST", body: { email, password } }),
  me: () => req<Me>("/auth/me"),

  // super-admin
  agencies: () => req<Agency[]>("/agencies"),
  createAgency: (d: any) => req<Agency>("/agencies", { method: "POST", body: d }),
  updateAgency: (id: string, d: any) => req<Agency>(`/agencies/${id}`, { method: "PUT", body: d }),
  deleteAgency: (id: string) => req<void>(`/agencies/${id}`, { method: "DELETE" }),

  // public showroom (by slug)
  publicAgency: (slug: string) => req<PublicAgency>(`/public/${slug}`),
  publicSales: (slug: string) => req<Sale[]>(`/public/${slug}/sales`),
  publicSale: (slug: string, id: string) => req<Sale>(`/public/${slug}/sales/${id}`),

  cars: () => req<Car[]>("/cars"),
  car: (id: string) => req<Car>(`/cars/${id}`),
  createCar: (d: Partial<Car>) => req<Car>("/cars", { method: "POST", body: d }),
  updateCar: (id: string, d: Partial<Car>) => req<Car>(`/cars/${id}`, { method: "PUT", body: d }),
  deleteCar: (id: string) => req<void>(`/cars/${id}`, { method: "DELETE" }),

  bookings: () => req<Booking[]>("/bookings"),
  createBooking: (d: { carId: string; customer: string; startDate: string; endDate: string }) =>
    req<Booking>("/bookings", { method: "POST", body: d }),
  deleteBooking: (id: string) => req<void>(`/bookings/${id}`, { method: "DELETE" }),

  sales: (query = "") => req<Sale[]>("/sales" + query),
  sale: (id: string) => req<Sale>(`/sales/${id}`),
  createSale: (d: Partial<Sale>) => req<Sale>("/sales", { method: "POST", body: d }),
  updateSale: (id: string, d: Partial<Sale>) => req<Sale>(`/sales/${id}`, { method: "PUT", body: d }),
  setSold: (id: string, sold: boolean) =>
    req<Sale>(`/sales/${id}/sold`, { method: "PATCH", body: { sold } }),
  deleteSale: (id: string) => req<void>(`/sales/${id}`, { method: "DELETE" }),

  upload: (files: File[]) => {
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));
    return req<{ paths: string[] }>("/uploads", { method: "POST", body: fd });
  },

  settings: () => req<Settings>("/settings"),
  updateSettings: (d: { logo?: string | null; cover?: string | null }) =>
    req<Settings>("/settings", { method: "PUT", body: d }),
};
