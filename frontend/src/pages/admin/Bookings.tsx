import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { daysBetween, fmtDate, money, nf, todayISO } from "../../lib/format";
import type { Booking } from "../../types";
import { KpiRow, PageHead, Spinner } from "../../components/ui";
import { useToast } from "../../components/Toast";

const dcut = (d: string) => d.slice(0, 10);

function status(b: Booking) {
  const t = todayISO();
  if (dcut(b.startDate) > t) return { t: "قادم", cls: "bg-[#ecebfd] text-[#4f46e5]" };
  if (dcut(b.endDate) < t) return { t: "منتهٍ", cls: "bg-line2 text-muted" };
  return { t: "جارٍ الآن", cls: "bg-okbg text-ok" };
}

export default function Bookings() {
  const toast = useToast();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const load = () => api.bookings().then(setBookings).catch(() => setBookings([]));
  useEffect(() => { load(); }, []);

  const kpis = useMemo(() => {
    const t = todayISO();
    const list = bookings || [];
    const active = list.filter((b) => dcut(b.startDate) <= t && dcut(b.endDate) >= t).length;
    const upcoming = list.filter((b) => dcut(b.startDate) > t).length;
    const revenue = list.reduce((s, b) => s + daysBetween(dcut(b.startDate), dcut(b.endDate)) * (b.car?.pricePerDay || 0), 0);
    return [
      { n: list.length, l: "إجمالي الحجوزات", c: "blue", icon: <I d="M3 5h18v16H3zM3 9h18M8 3v4M16 3v4" /> },
      { n: active, l: "نشطة الآن", c: "green", icon: <I d="M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2" /> },
      { n: upcoming, l: "قادمة", c: "indigo", icon: <I d="M12 5v14M5 12h14" /> },
      { n: nf(revenue) + " دج", l: "إجمالي الإيرادات", c: "red", icon: <I d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /> },
    ];
  }, [bookings]);

  if (!bookings) return <Spinner />;

  const del = async (id: string) => {
    if (!confirm("حذف هذا الحجز؟")) return;
    await api.deleteBooking(id);
    toast("تم حذف الحجز");
    load();
  };

  return (
    <>
      <PageHead title="الحجوزات" subtitle="جميع الحجوزات الحالية والقادمة والمنتهية." />
      <KpiRow items={kpis} />

      {bookings.length === 0 ? (
        <div className="card py-14 text-center text-muted">لا توجد حجوزات بعد. ابدأ من صفحة الأسطول.</div>
      ) : (
        <>
          {/* mobile: cards */}
          <div className="space-y-3 md:hidden">
            {bookings.map((b) => {
              const s = status(b);
              const d = daysBetween(dcut(b.startDate), dcut(b.endDate));
              return (
                <div key={b.id} className="card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <b>{b.car?.name || "—"}</b>
                    <span className={`pill ${s.cls}`}>{s.t}</span>
                  </div>
                  <div className="mt-1 text-sm text-muted">{b.customer}</div>
                  <div className="mt-2 text-sm">{fmtDate(b.startDate)} ← {fmtDate(b.endDate)} · {d} يوم</div>
                  <div className="mt-2 flex items-center justify-between">
                    <b>{money(d * (b.car?.pricePerDay || 0))}</b>
                    <button className="btn btn-danger btn-sm" onClick={() => del(b.id)}>حذف</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* desktop: table */}
          <div className="card hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-sm">
                <thead>
                  <tr className="bg-line2 text-right text-xs font-bold text-muted">
                    <Th>السيارة</Th><Th>العميل</Th><Th>من</Th><Th>إلى</Th><Th>الأيام</Th><Th>الإجمالي</Th><Th>الحالة</Th><Th> </Th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const s = status(b);
                    const d = daysBetween(dcut(b.startDate), dcut(b.endDate));
                    return (
                      <tr key={b.id} className="border-b border-line2 last:border-0 hover:bg-line2">
                        <Td><b>{b.car?.name || "—"}</b></Td>
                        <Td>{b.customer}</Td>
                        <Td>{fmtDate(b.startDate)}</Td>
                        <Td>{fmtDate(b.endDate)}</Td>
                        <Td>{d}</Td>
                        <Td><b>{money(d * (b.car?.pricePerDay || 0))}</b></Td>
                        <Td><span className={`pill ${s.cls}`}>{s.t}</span></Td>
                        <Td><button className="btn btn-danger btn-sm" onClick={() => del(b.id)}>حذف</button></Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}

const Th = ({ children }: any) => <th className="px-4 py-4 text-right font-bold">{children}</th>;
const Td = ({ children }: any) => <td className="px-4 py-3.5 text-right">{children}</td>;
const I = ({ d }: { d: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-full w-full"><path d={d} /></svg>;
