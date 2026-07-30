import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, imgUrl } from "../../lib/api";
import { fmtDate, nf, overlaps, todayISO } from "../../lib/format";
import type { Booking, Car } from "../../types";
import { KpiRow, PageHead, Spinner } from "../../components/ui";
import { useToast } from "../../components/Toast";

const dcut = (d: string) => d.slice(0, 10);

export default function Fleet() {
  const toast = useToast();
  const [cars, setCars] = useState<Car[] | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const load = () => {
    api.cars().then(setCars);
    api.bookings().then(setBookings).catch(() => setBookings([]));
  };
  useEffect(load, []);

  const currentOf = (carId: string) => {
    const t = todayISO();
    return bookings.find((b) => b.carId === carId && overlaps(t, t, dcut(b.startDate), dcut(b.endDate)));
  };

  const kpis = useMemo(() => {
    const total = cars?.length ?? 0;
    const rented = cars?.filter((c) => currentOf(c.id)).length ?? 0;
    const upcoming = bookings.filter((b) => dcut(b.startDate) > todayISO()).length;
    return [
      { n: total, l: "Total voitures", c: "blue", icon: <Ic d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11m-14 0h14m-14 0v5m14-5v5M7.5 16h.01M16.5 16h.01M5 16h14v2H5z" /> },
      { n: total - rented, l: "Disponibles", c: "green", icon: <Ic d="M20 6L9 17l-5-5" /> },
      { n: rented, l: "En location", c: "red", icon: <Ic d="M18 6 6 18M6 6l12 12" /> },
      { n: upcoming, l: "Réservations à venir", c: "indigo", icon: <Ic d="M12 5v14M5 12h14" /> },
    ];
  }, [cars, bookings]);

  if (!cars) return <Spinner />;

  const del = async (c: Car) => {
    if (!confirm(`Supprimer ${c.name} ?`)) return;
    await api.deleteCar(c.id);
    toast("Voiture supprimée");
    load();
  };

  return (
    <>
      <PageHead
        title="Flotte"
        subtitle="Gérez les voitures de location et les réservations — les conflits de dates sont bloqués automatiquement."
        action={<Link to="/admin/fleet/new" className="btn btn-primary"><Ic d="M12 5v14M5 12h14" cls="h-4 w-4" /> Ajouter une voiture</Link>}
      />
      <KpiRow items={kpis} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cars.map((c) => {
          const cur = currentOf(c.id);
          return (
            <article key={c.id} className="card flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg2">
              <div className="relative aspect-[16/10] bg-line2">
                <img src={imgUrl(c.image)} alt={c.name} loading="lazy" className="h-full w-full object-cover" />
                <span className={`pill absolute right-3 top-3 shadow ${cur ? "bg-white text-danger" : "bg-white text-ok"}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {cur ? `Louée jusqu'au ${fmtDate(cur.endDate)}` : "Disponible"}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="text-[11.5px] font-bold uppercase tracking-wide text-muted">{c.bodyType} · {c.year}</div>
                <h3 className="mb-3 mt-1 text-lg font-extrabold">{c.name}</h3>
                <div className="mb-4 flex flex-wrap gap-2">
                  {[`${c.seats} places`, c.transmission, c.fuel].map((s, i) => (
                    <span key={i} className="rounded-lg bg-line2 px-2.5 py-1 text-xs font-semibold text-ink2">{s}</span>
                  ))}
                </div>
                <div className="mt-auto flex items-baseline justify-between border-t border-line2 pt-3.5">
                  <div><b className="text-[22px] font-extrabold">{nf(c.pricePerDay)}</b><span className="ml-1 text-[12.5px] text-muted">DA / jour</span></div>
                </div>
                <div className="mt-3.5 flex gap-2">
                  <Link to={`/admin/fleet/${c.id}/book`} className="btn btn-primary flex-1">Réserver</Link>
                  <Link to={`/admin/fleet/${c.id}/edit`} className="btn btn-sm">Modifier</Link>
                  <button className="btn btn-danger btn-sm" onClick={() => del(c)}>Supprimer</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function Ic({ d, cls = "h-full w-full" }: { d: string; cls?: string }) {
  return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d={d} /></svg>;
}
