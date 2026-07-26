import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, imgUrl } from "../../lib/api";
import type { Sale } from "../../types";
import { Alert, PageHead, Spinner } from "../../components/ui";
import { useToast } from "../../components/Toast";

const FUELS = ["بنزين", "ديزل", "هجين", "كهرباء"];
const GEARBOXES = ["أوتوماتيك", "يدوي"];

export default function SaleForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const nav = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(editing);
  const [f, setF] = useState({
    title: "", brand: "", model: "", year: "", price: "", km: "",
    fuel: "بنزين", gearbox: "أوتوماتيك", color: "", phone: "", wilaya: "", description: "",
  });
  const [existing, setExisting] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.sale(id).then((s) => {
      setF({
        title: s.title, brand: s.brand || "", model: s.model || "", year: s.year?.toString() || "",
        price: s.price.toString(), km: s.km?.toString() || "", fuel: s.fuel || "بنزين",
        gearbox: s.gearbox || "أوتوماتيك", color: s.color || "", phone: s.phone || "",
        wilaya: s.wilaya || "", description: s.description || "",
      });
      setExisting(s.images || []);
    }).catch(() => setErr("تعذّر تحميل الإعلان")).finally(() => setLoading(false));
  }, [id]);

  const up = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!f.title.trim()) return setErr("عنوان الإعلان مطلوب.");
    if (!f.price) return setErr("السعر مطلوب.");
    setBusy(true);
    try {
      let uploaded: string[] = [];
      if (files.length) uploaded = (await api.upload(files)).paths;
      const payload: Partial<Sale> = {
        title: f.title.trim(), brand: f.brand, model: f.model,
        year: f.year ? Number(f.year) : null, price: Number(f.price), km: f.km ? Number(f.km) : null,
        fuel: f.fuel, gearbox: f.gearbox, color: f.color, phone: f.phone, wilaya: f.wilaya,
        description: f.description, images: [...existing, ...uploaded],
      };
      if (editing) await api.updateSale(id!, payload);
      else await api.createSale(payload);
      toast(editing ? "✅ تم حفظ التعديلات" : "✅ تمت إضافة السيارة للبيع");
      nav("/admin/sales");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <>
      <Link to="/admin/sales" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-ink">→ رجوع إلى سيارات للبيع</Link>
      <PageHead title={editing ? "تعديل إعلان" : "إضافة سيارة للبيع"} subtitle="بيانات الإعلان الذي سيظهر في المعرض العام." />

      <form onSubmit={submit} className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.4fr_.9fr]">
        <div className="card p-5 sm:p-6">
          <div className="mb-5 border-b border-line2 pb-3 text-[15px] font-extrabold">بيانات الإعلان</div>

          <label className="label">عنوان الإعلان</label>
          <input className="input" value={f.title} onChange={up("title")} placeholder="Volkswagen Tiguan 2020 بحالة ممتازة" />

          <Grid3>
            <Fld l="الماركة"><input className="input" value={f.brand} onChange={up("brand")} placeholder="Volkswagen" /></Fld>
            <Fld l="الموديل"><input className="input" value={f.model} onChange={up("model")} placeholder="Tiguan" /></Fld>
            <Fld l="السنة"><input className="input" type="number" value={f.year} onChange={up("year")} placeholder="2020" /></Fld>
          </Grid3>
          <Grid3>
            <Fld l="السعر (دج)"><input className="input" type="number" value={f.price} onChange={up("price")} placeholder="4800000" /></Fld>
            <Fld l="الكيلومتراج"><input className="input" type="number" value={f.km} onChange={up("km")} placeholder="52000" /></Fld>
            <Fld l="اللون"><input className="input" value={f.color} onChange={up("color")} placeholder="أبيض" /></Fld>
          </Grid3>
          <Grid3>
            <Fld l="نوع الوقود"><select className="input" value={f.fuel} onChange={up("fuel")}>{FUELS.map((x) => <option key={x}>{x}</option>)}</select></Fld>
            <Fld l="ناقل الحركة"><select className="input" value={f.gearbox} onChange={up("gearbox")}>{GEARBOXES.map((x) => <option key={x}>{x}</option>)}</select></Fld>
            <Fld l="الولاية"><input className="input" value={f.wilaya} onChange={up("wilaya")} placeholder="الجزائر العاصمة" /></Fld>
          </Grid3>

          <label className="label mt-4">رقم الهاتف للتواصل</label>
          <input className="input" value={f.phone} onChange={up("phone")} placeholder="05XX XX XX XX" />

          <label className="label mt-4">الوصف</label>
          <textarea className="input min-h-[96px]" value={f.description} onChange={up("description")} placeholder="حالة السيارة، التجهيزات، الصيانة…" />

          {err && <Alert>{err}</Alert>}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button className="btn btn-primary sm:flex-1" disabled={busy}>{busy ? "جارٍ الحفظ…" : editing ? "حفظ التعديلات" : "نشر الإعلان"}</button>
            <Link to="/admin/sales" className="btn">إلغاء</Link>
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <div className="mb-4 text-[15px] font-extrabold">صور السيارة</div>
          <label className="btn mb-3 w-full cursor-pointer">
            + إضافة صور
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setFiles([...files, ...Array.from(e.target.files || [])])} />
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {existing.map((p, i) => <Thumb key={"e" + i} src={imgUrl(p)} onRemove={() => setExisting(existing.filter((_, j) => j !== i))} />)}
            {files.map((file, i) => <Thumb key={"f" + i} src={URL.createObjectURL(file)} onRemove={() => setFiles(files.filter((_, j) => j !== i))} />)}
          </div>
          {existing.length + files.length === 0 && <p className="mt-2 text-sm text-muted">لم تتم إضافة صور بعد.</p>}
        </div>
      </form>
    </>
  );
}

const Grid3 = ({ children }: any) => <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">{children}</div>;
const Fld = ({ l, children }: any) => <div><label className="label">{l}</label>{children}</div>;
function Thumb({ src, onRemove }: { src: string; onRemove: () => void }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-lg border border-line">
      <img src={src} className="h-full w-full object-cover" />
      <button type="button" onClick={onRemove} className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-md bg-black/75 text-white">&times;</button>
    </div>
  );
}
