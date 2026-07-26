import type { Booking, Car, Sale, Settings, User } from "../types";

const ORIGIN = (import.meta.env.VITE_API_URL as string) || "";
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
  me: () => req<User>("/auth/me"),

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
