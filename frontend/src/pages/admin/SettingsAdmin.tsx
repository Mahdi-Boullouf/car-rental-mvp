import { FormEvent, useEffect, useState } from "react";
import { api, imgUrl } from "../../lib/api";
import { setSettingsCache } from "../../lib/useSettings";
import { Alert, PageHead, Spinner } from "../../components/ui";
import { useToast } from "../../components/Toast";

export default function SettingsAdmin() {
  const toast = useToast();
  const [loaded, setLoaded] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [cover, setCover] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.settings().then((s) => { setLogo(s.logo); setCover(s.cover); }).catch(() => {}).finally(() => setLoaded(true));
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      let logoPath = logo;
      let coverPath = cover;
      if (logoFile) logoPath = (await api.upload([logoFile])).paths[0];
      if (coverFile) coverPath = (await api.upload([coverFile])).paths[0];
      const s = await api.updateSettings({ logo: logoPath, cover: coverPath });
      setSettingsCache(s);
      setLogo(s.logo); setCover(s.cover); setLogoFile(null); setCoverFile(null);
      toast("✅ تم حفظ إعدادات المعرض");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!loaded) return <Spinner />;

  const logoPreview = logoFile ? URL.createObjectURL(logoFile) : logo ? imgUrl(logo) : "";
  const coverPreview = coverFile ? URL.createObjectURL(coverFile) : cover ? imgUrl(cover) : "";

  return (
    <>
      <PageHead title="إعدادات المعرض" subtitle="الشعار وصورة الغلاف اللذان يظهران في أعلى صفحة البيع العامة." />

      <form onSubmit={submit} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* logo */}
        <div className="card p-5 sm:p-6">
          <div className="mb-4 text-[15px] font-extrabold">الشعار (Logo)</div>
          <div className="mb-4 grid h-32 place-items-center rounded-xl border border-line bg-line2 p-4">
            {logoPreview ? (
              <img src={logoPreview} alt="logo" className="max-h-24 w-auto object-contain" />
            ) : (
              <div className="grid h-14 w-14 place-items-center rounded-xl bg-grad-brand text-sm font-extrabold text-white">MC</div>
            )}
          </div>
          <div className="flex gap-2">
            <label className="btn flex-1 cursor-pointer">
              {logoPreview ? "تغيير الشعار" : "اختيار شعار"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
            </label>
            {(logoPreview) && <button type="button" className="btn btn-danger" onClick={() => { setLogo(null); setLogoFile(null); }}>إزالة</button>}
          </div>
          <p className="mt-2 text-xs text-muted">يُنصح بصورة PNG بخلفية شفافة.</p>
        </div>

        {/* cover */}
        <div className="card p-5 sm:p-6">
          <div className="mb-4 text-[15px] font-extrabold">صورة الغلاف (Cover)</div>
          <div className="mb-4 aspect-[16/7] overflow-hidden rounded-xl border border-line bg-line2">
            {coverPreview ? (
              <img src={coverPreview} alt="cover" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center bg-grad-navy text-sm text-white/70">الغلاف الافتراضي (تدرّج لوني)</div>
            )}
          </div>
          <div className="flex gap-2">
            <label className="btn flex-1 cursor-pointer">
              {coverPreview ? "تغيير الغلاف" : "اختيار غلاف"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
            </label>
            {(coverPreview) && <button type="button" className="btn btn-danger" onClick={() => { setCover(null); setCoverFile(null); }}>إزالة</button>}
          </div>
          <p className="mt-2 text-xs text-muted">صورة عريضة (مثال 1600×700) تظهر خلف عنوان المعرض.</p>
        </div>

        {err && <div className="lg:col-span-2"><Alert>{err}</Alert></div>}
        <div className="lg:col-span-2">
          <button className="btn btn-primary w-full sm:w-auto" disabled={busy}>{busy ? "جارٍ الحفظ…" : "حفظ الإعدادات"}</button>
        </div>
      </form>
    </>
  );
}
