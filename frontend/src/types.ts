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

export type User = { id: string; name: string; email: string; role: string };

export type Settings = { id: number; logo: string | null; cover: string | null; updatedAt: string };
