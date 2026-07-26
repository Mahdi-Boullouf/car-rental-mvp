import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import { fmtDate, money, todayISO } from "../../lib/format";
import type { Booking, Car } from "../../types";
import { Alert, PageHead, Spinner } from "../../components/ui";
import { useToast } from "../../components/Toast";

export default function BookingForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();

  const [car, setCar] = useState<Car | null>(null);
  const [mine, setMine] = useState<Booking[]>([]);
  const [customer, setCustomer] = useState("");
  const [start, setStart] = useState(todayISO());
  const [end, setEnd] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.car(id).then(setCar).catch(() => setErr("تعذّر تحميل السيارة"));
    api.bookings().then((all) => setMine(all.filter((b) => b.carId === id).sort((a, b) => a.startDate.localeCompare(b.startDate)))).catch(() => {});
  }, [id]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await api.createBooking({ carId: id!, customer: customer.trim(), startDate: start, endDate: end });
      toast("✅ تم تأكيد الحجز");
      nav("/admin");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!car) return err ? <div className="text-danger">{err}</div> : <Spinner />;

  return (
    <>
      <Link to="/admin" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-ink">→ رجوع إلى الأسطول</Link>
      <PageHead title="حجز سيارة" subtitle={`${car.name} · ${money(car.pricePerDay)} / يوم`} />

      <form onSubmit={submit} className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="card p-5 sm:p-6">
          <label className="label">اسم العميل</label>
          <input className="input" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="اسم المستأجر" required />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="label">من تاريخ</label><input className="input" type="date" value={start} onChange={(e) => setStart(e.target.value)} required /></div>
            <div><label className="label">إلى تاريخ</label><input className="input" type="date" value={end} onChange={(e) => setEnd(e.target.value)} required /></div>
          </div>
          {err && <Alert>🚫 {err}</Alert>}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button className="btn btn-primary sm:flex-1" disabled={busy}>{busy ? "…" : "تأكيد الحجز"}</button>
            <Link to="/admin" className="btn">إلغاء</Link>
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <h4 className="mb-3 text-[13px] font-bold text-muted">الفترات المحجوزة لهذه السيارة</h4>
          {mine.length === 0 ? (
            <p className="text-sm text-muted">لا توجد حجوزات — هذه أول فترة.</p>
          ) : (
            mine.map((b) => (
              <div key={b.id} className="mb-1.5 flex flex-wrap justify-between gap-2 rounded-lg bg-line2 px-3 py-2.5 text-[13px]">
                <span className="text-muted">{b.customer}</span>
                <b>{fmtDate(b.startDate)} ← {fmtDate(b.endDate)}</b>
              </div>
            ))
          )}
        </div>
      </form>
    </>
  );
}
