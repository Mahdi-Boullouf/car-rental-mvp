export type Car = {
  id: string;
  name: string;
  bodyType: string;
  year: number;
  fuel: string;
  transmission: string;
  seats: number;
  pricePerDay: number;
  image: string;
  createdAt: string;
};

export type Booking = {
  id: string;
  carId: string;
  customer: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  car?: Car;
};

export type Sale = {
  id: string;
  title: string;
  brand?: string;
  model?: string;
  year?: number | null;
  price: number;
  km?: number | null;
  fuel?: string;
  gearbox?: string;
  color?: string;
  phone?: string;
  wilaya?: string;
  description?: string;
  images: string[];
  sold: boolean;
  createdAt: string;
};

export type Role = "SUPER_ADMIN" | "OWNER" | "AGENT";

export type User = { id: string; name: string; email: string; role: Role; agencyId: string | null };

export type AgencyModules = {
  id: string;
  name: string;
  slug: string;
  rentalsEnabled: boolean;
  salesEnabled: boolean;
  active: boolean;
};

export type Me = {
  id: string;
  name: string;
  email: string;
  role: Role;
  agency: AgencyModules | null;
};

export type Agency = {
  id: string;
  name: string;
  slug: string;
  city?: string | null;
  phone?: string | null;
  active: boolean;
  rentalsEnabled: boolean;
  salesEnabled: boolean;
  createdAt: string;
  ownerName?: string | null;
  ownerEmail?: string | null;
  cars: number;
  sales: number;
};

export type PublicAgency = {
  name: string;
  slug: string;
  city?: string | null;
  phone?: string | null;
  salesEnabled: boolean;
  logo: string | null;
  cover: string | null;
};

export type Settings = { id: string; agencyId: string; logo: string | null; cover: string | null; updatedAt: string };
