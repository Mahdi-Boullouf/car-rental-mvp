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
    if (!f.name.trim()) return setErr("Le nom de l'agence est requis.");
    if (!f.slug.trim()) return setErr("Le lien (slug) est requis.");
    if (!rentals && !sales) return setErr("Activez au moins un module (location ou vente).");
    if (!f.ownerName.trim() || !f.ownerEmail.trim() || f.ownerPassword.length < 6)
      return setErr("Informations du propriétaire incomplètes (mot de passe : 6 caractères minimum).");
    setBusy(true);
    try {
      await api.createAgency({
        name: f.name.trim(), slug: f.slug.trim(), city: f.city, phone: f.phone,
        rentalsEnabled: rentals, salesEnabled: sales,
        ownerName: f.ownerName.trim(), ownerEmail: f.ownerEmail.trim(), ownerPassword: f.ownerPassword,
      });
      toast("✅ Agence créée");
      nav("/admin/agencies");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Link to="/admin/agencies" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-ink">← Retour aux agences</Link>
      <PageHead title="Ajouter une agence" subtitle="Créez le compte de la concession, choisissez ses modules et remettez les identifiants au propriétaire." />

      <form onSubmit={submit} className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        {/* Agency */}
        <div className="card p-5 sm:p-6">
          <div className="mb-5 border-b border-line2 pb-3 text-[15px] font-extrabold">Informations de l'agence</div>
          <label className="label">Nom de l'agence</label>
          <input className="input" value={f.name} onChange={onName} placeholder="Elite Cars" />
          <label className="label mt-4">Lien public (slug)</label>
          <input className="input" value={f.slug} onChange={(e) => { setSlugEdited(true); setF({ ...f, slug: slugify(e.target.value) }); }} placeholder="elite-cars" />
          <p className="mt-1.5 text-xs text-muted">La page de la vitrine sera: {window.location.host}/<b className="text-ink2">{f.slug || "slug"}</b></p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="label">Wilaya</label><input className="input" value={f.city} onChange={up("city")} placeholder="Oran" /></div>
            <div><label className="label">Téléphone</label><input className="input" value={f.phone} onChange={up("phone")} placeholder="05XX XX XX XX" /></div>
          </div>

          <div className="mt-5">
            <div className="label">Modules activés</div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Toggle on={rentals} onClick={() => setRentals(!rentals)} title="Location" desc="Flotte + réservations + contrats" />
              <Toggle on={sales} onClick={() => setSales(!sales)} title="Vente" desc="Vitrine publique + annonces" />
            </div>
          </div>
        </div>

        {/* Owner */}
        <div className="card p-5 sm:p-6">
          <div className="mb-5 border-b border-line2 pb-3 text-[15px] font-extrabold">Compte du propriétaire</div>
          <label className="label">Nom complet</label>
          <input className="input" value={f.ownerName} onChange={up("ownerName")} placeholder="Nom du propriétaire" />
          <label className="label mt-4">E-mail (connexion)</label>
          <input className="input" type="email" value={f.ownerEmail} onChange={up("ownerEmail")} placeholder="owner@elite.dz" />
          <label className="label mt-4">Mot de passe</label>
          <input className="input" value={f.ownerPassword} onChange={up("ownerPassword")} placeholder="6 caractères minimum" />
          <p className="mt-2 text-xs text-muted">Remettez cet e-mail et ce mot de passe au propriétaire — il s'en servira pour se connecter.</p>

          {err && <Alert>{err}</Alert>}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button className="btn btn-primary sm:flex-1" disabled={busy}>{busy ? "Création…" : "Créer l'agence"}</button>
            <Link to="/admin/agencies" className="btn">Annuler</Link>
          </div>
        </div>
      </form>
    </>
  );
}

function Toggle({ on, onClick, title, desc }: { on: boolean; onClick: () => void; title: string; desc: string }) {
  return (
    <button type="button" onClick={onClick} className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition ${on ? "border-brand bg-brand/5" : "border-line bg-white"}`}>
      <div>
        <b className="text-sm">{title}</b>
        <div className="text-xs text-muted">{desc}</div>
      </div>
      <span className={`relative h-6 w-11 flex-none rounded-full transition ${on ? "bg-brand" : "bg-line"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}
