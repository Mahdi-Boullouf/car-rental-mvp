import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, imgUrl } from "../../lib/api";
import { Alert, PageHead, Spinner } from "../../components/ui";
import { useToast } from "../../components/Toast";

const BODY_TYPES = ["SUV de luxe", "SUV familial", "SUV compact", "SUV économique", "Berline", "Citadine", "Coupé", "Pick-up", "Monospace"];
const FUELS = ["Essence", "Diesel", "Hybride", "Électrique"];
const TRANSMISSIONS = ["Automatique", "Manuelle"];
const SEATS = [2, 4, 5, 7, 8, 9];

const currentYear = new Date().getFullYear();

export default function CarForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const nav = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(editing);
  const [f, setF] = useState({
    name: "",
    bodyType: "SUV familial",
    year: String(currentYear),
    fuel: "Essence",
    transmission: "Automatique",
    seats: "5",
    pricePerDay: "",
  });
  const [image, setImage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .car(id)
      .then((c) => {
        setF({
          name: c.name,
          bodyType: c.bodyType,
          year: String(c.year),
          fuel: c.fuel,
          transmission: c.transmission,
          seats: String(c.seats),
          pricePerDay: String(c.pricePerDay),
        });
        setImage(c.image);
      })
      .catch(() => setErr("Impossible de charger la voiture"))
      .finally(() => setLoading(false));
  }, [id]);

  const up = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!f.name.trim()) return setErr("Le nom de la voiture est requis.");
    if (!f.pricePerDay || Number(f.pricePerDay) <= 0) return setErr("Saisissez un tarif journalier valide.");
    setBusy(true);
    try {
      let img = image;
      if (file) img = (await api.upload([file])).paths[0];
      if (!img) throw new Error("Veuillez choisir une photo de la voiture.");
      const payload = {
        name: f.name.trim(),
        bodyType: f.bodyType,
        year: Number(f.year),
        fuel: f.fuel,
        transmission: f.transmission,
        seats: Number(f.seats),
        pricePerDay: Number(f.pricePerDay),
        image: img,
      };
      if (editing) await api.updateCar(id!, payload);
      else await api.createCar(payload);
      toast(editing ? "✅ Modifications enregistrées" : "✅ Voiture ajoutée");
      nav("/admin");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner />;

  const preview = file ? URL.createObjectURL(file) : image ? imgUrl(image) : "";

  return (
    <>
      <Link to="/admin" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-ink">← Retour à la flotte</Link>
      <PageHead
        title={editing ? "Modifier la voiture" : "Ajouter une voiture à la flotte"}
        subtitle="Tous les champs sont guidés — choisissez dans les listes pour garder des données homogènes."
      />

      <form onSubmit={submit} className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.4fr_.9fr]">
        {/* fields */}
        <div className="card p-6">
          <div className="mb-5 border-b border-line2 pb-3 text-[15px] font-extrabold">Informations sur la voiture</div>

          <label className="label">Nom de la voiture</label>
          <input className="input" value={f.name} onChange={up("name")} placeholder="Volkswagen Tiguan" />

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Type de carrosserie">
              <select className="input" value={f.bodyType} onChange={up("bodyType")}>
                {BODY_TYPES.map((b) => <option key={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="Année">
              <input className="input" type="number" min={1950} max={2100} value={f.year} onChange={up("year")} />
            </Field>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Carburant">
              <select className="input" value={f.fuel} onChange={up("fuel")}>
                {FUELS.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field label="Boîte de vitesses">
              <select className="input" value={f.transmission} onChange={up("transmission")}>
                {TRANSMISSIONS.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field label="Nombre de places">
              <select className="input" value={f.seats} onChange={up("seats")}>
                {SEATS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Tarif journalier (DA)">
              <input className="input" type="number" min={0} value={f.pricePerDay} onChange={up("pricePerDay")} placeholder="11000" />
            </Field>
          </div>

          {err && <Alert>{err}</Alert>}

          <div className="mt-6 flex gap-3">
            <button className="btn btn-primary" disabled={busy}>{busy ? "Enregistrement…" : editing ? "Enregistrer" : "Ajouter la voiture"}</button>
            <Link to="/admin" className="btn">Annuler</Link>
          </div>
        </div>

        {/* image */}
        <div className="card p-6">
          <div className="mb-4 text-[15px] font-extrabold">Photo de la voiture</div>
          <div className="mb-4 aspect-[16/10] overflow-hidden rounded-xl border border-line bg-line2">
            {preview ? (
              <img src={preview} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-sm text-muted">Aucune photo</div>
            )}
          </div>
          <label className="btn w-full cursor-pointer">
            {preview ? "Changer la photo" : "Choisir une photo"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
        </div>
      </form>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
