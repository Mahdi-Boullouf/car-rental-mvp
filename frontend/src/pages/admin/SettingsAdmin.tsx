import { FormEvent, useEffect, useState } from "react";
import { api, imgUrl } from "../../lib/api";
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
      setLogo(s.logo); setCover(s.cover); setLogoFile(null); setCoverFile(null);
      toast("✅ Paramètres enregistrés");
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
      <PageHead title="Paramètres de la vitrine" subtitle="Le logo et l'image de couverture affichés en haut de la vitrine publique." />

      <form onSubmit={submit} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* logo */}
        <div className="card p-5 sm:p-6">
          <div className="mb-4 text-[15px] font-extrabold">Logo</div>
          <div className="mb-4 grid h-32 place-items-center rounded-xl border border-line bg-line2 p-4">
            {logoPreview ? (
              <img src={logoPreview} alt="logo" className="max-h-24 w-auto object-contain" />
            ) : (
              <div className="grid h-14 w-14 place-items-center rounded-xl bg-grad-brand text-sm font-extrabold text-white">MC</div>
            )}
          </div>
          <div className="flex gap-2">
            <label className="btn flex-1 cursor-pointer">
              {logoPreview ? "Changer le logo" : "Choisir un logo"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
            </label>
            {(logoPreview) && <button type="button" className="btn btn-danger" onClick={() => { setLogo(null); setLogoFile(null); }}>Retirer</button>}
          </div>
          <p className="mt-2 text-xs text-muted">Un PNG à fond transparent est recommandé.</p>
        </div>

        {/* cover */}
        <div className="card p-5 sm:p-6">
          <div className="mb-4 text-[15px] font-extrabold">Image de couverture</div>
          <div className="mb-4 aspect-[16/7] overflow-hidden rounded-xl border border-line bg-line2">
            {coverPreview ? (
              <img src={coverPreview} alt="cover" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center bg-grad-navy text-sm text-white/70">Couverture par défaut (dégradé)</div>
            )}
          </div>
          <div className="flex gap-2">
            <label className="btn flex-1 cursor-pointer">
              {coverPreview ? "Changer la couverture" : "Choisir une couverture"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
            </label>
            {(coverPreview) && <button type="button" className="btn btn-danger" onClick={() => { setCover(null); setCoverFile(null); }}>Retirer</button>}
          </div>
          <p className="mt-2 text-xs text-muted">Image large (ex. 1600×700) affichée derrière le titre de la vitrine.</p>
        </div>

        {err && <div className="lg:col-span-2"><Alert>{err}</Alert></div>}
        <div className="lg:col-span-2">
          <button className="btn btn-primary w-full sm:w-auto" disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer"}</button>
        </div>
      </form>
    </>
  );
}
