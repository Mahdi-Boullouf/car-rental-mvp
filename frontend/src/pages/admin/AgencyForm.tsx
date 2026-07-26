import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { Alert, PageHead } from "../../components/ui";
import { useToast } from "../../components/Toast";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

export default function AgencyForm() {
  const nav = useNavigate();
  const toast = useToast();
  const [f, setF] = useState({ name: "", slug: "", city: "", phone: "", ownerName: "", ownerEmail: "", ownerPassword: "" });
  const [rentals, setRentals] = useState(true);
  const [sales, setSales] = useState(true);
  const [slugEdited, setSlugEdited] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const up = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  const onName = (e: any) => {
    const name = e.target.value;
    setF((p) => ({ ...p, name, slug: slugEdited ? p.slug : slugify(name) }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!f.name.trim()) return setErr("اسم الوكالة مطلوب.");
    if (!f.slug.trim()) return setErr("الرابط (slug) مطلوب.");
    if (!rentals && !sales) return setErr("فعّل وحدة واحدة على الأقل (تأجير أو بيع).");
    if (!f.ownerName.trim() || !f.ownerEmail.trim() || f.ownerPassword.length < 6)
      return setErr("بيانات المالك ناقصة (كلمة المرور 6 أحرف على الأقل).");
    setBusy(true);
    try {
      await api.createAgency({
        name: f.name.trim(), slug: f.slug.trim(), city: f.city, phone: f.phone,
        rentalsEnabled: rentals, salesEnabled: sales,
        ownerName: f.ownerName.trim(), ownerEmail: f.ownerEmail.trim(), ownerPassword: f.ownerPassword,
      });
      toast("✅ تم إنشاء الوكالة");
      nav("/admin/agencies");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Link to="/admin/agencies" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-ink">→ رجوع إلى الوكالات</Link>
      <PageHead title="إضافة وكالة" subtitle="أنشئ حساب المعرض، اختر وحداته، وسلّم المالك بيانات الدخول." />

      <form onSubmit={submit} className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        {/* Agency */}
        <div className="card p-5 sm:p-6">
          <div className="mb-5 border-b border-line2 pb-3 text-[15px] font-extrabold">بيانات الوكالة</div>
          <label className="label">اسم الوكالة</label>
          <input className="input" value={f.name} onChange={onName} placeholder="Elite Cars" />
          <label className="label mt-4">الرابط العام (slug)</label>
          <input className="input" value={f.slug} onChange={(e) => { setSlugEdited(true); setF({ ...f, slug: slugify(e.target.value) }); }} placeholder="elite-cars" />
          <p className="mt-1.5 text-xs text-muted">صفحة المعرض ستكون: {window.location.host}/<b className="text-ink2">{f.slug || "slug"}</b></p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="label">الولاية</label><input className="input" value={f.city} onChange={up("city")} placeholder="وهران" /></div>
            <div><label className="label">الهاتف</label><input className="input" value={f.phone} onChange={up("phone")} placeholder="05XX XX XX XX" /></div>
          </div>

          <div className="mt-5">
            <div className="label">الوحدات المفعّلة</div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Toggle on={rentals} onClick={() => setRentals(!rentals)} title="التأجير" desc="أسطول + حجوزات + عقود" />
              <Toggle on={sales} onClick={() => setSales(!sales)} title="البيع" desc="معرض عام + إعلانات" />
            </div>
          </div>
        </div>

        {/* Owner */}
        <div className="card p-5 sm:p-6">
          <div className="mb-5 border-b border-line2 pb-3 text-[15px] font-extrabold">حساب المالك</div>
          <label className="label">الاسم الكامل</label>
          <input className="input" value={f.ownerName} onChange={up("ownerName")} placeholder="اسم صاحب المعرض" />
          <label className="label mt-4">البريد الإلكتروني (للدخول)</label>
          <input className="input" type="email" value={f.ownerEmail} onChange={up("ownerEmail")} placeholder="owner@elite.dz" />
          <label className="label mt-4">كلمة المرور</label>
          <input className="input" value={f.ownerPassword} onChange={up("ownerPassword")} placeholder="6 أحرف على الأقل" />
          <p className="mt-2 text-xs text-muted">سلّم المالك هذا البريد وكلمة المرور — سيدخل بهما إلى لوحته.</p>

          {err && <Alert>{err}</Alert>}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button className="btn btn-primary sm:flex-1" disabled={busy}>{busy ? "جارٍ الإنشاء…" : "إنشاء الوكالة"}</button>
            <Link to="/admin/agencies" className="btn">إلغاء</Link>
          </div>
        </div>
      </form>
    </>
  );
}

function Toggle({ on, onClick, title, desc }: { on: boolean; onClick: () => void; title: string; desc: string }) {
  return (
    <button type="button" onClick={onClick} className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-right transition ${on ? "border-brand bg-brand/5" : "border-line bg-white"}`}>
      <div>
        <b className="text-sm">{title}</b>
        <div className="text-xs text-muted">{desc}</div>
      </div>
      <span className={`relative h-6 w-11 flex-none rounded-full transition ${on ? "bg-brand" : "bg-line"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-0.5" : "left-[22px]"}`} />
      </span>
    </button>
  );
}
