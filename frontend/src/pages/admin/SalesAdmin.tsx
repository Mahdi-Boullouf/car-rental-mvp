import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, imgUrl } from "../../lib/api";
import { money, nf } from "../../lib/format";
import type { Sale } from "../../types";
import { KpiRow, PageHead, Spinner } from "../../components/ui";
import { useToast } from "../../components/Toast";

export default function SalesAdmin() {
  const toast = useToast();
  const [sales, setSales] = useState<Sale[] | null>(null);
  const load = () => api.sales().then(setSales);
  useEffect(() => { load(); }, []);

  const kpis = useMemo(() => {
    const list = sales || [];
    const sold = list.filter((s) => s.sold).length;
    const stock = list.filter((s) => !s.sold).reduce((a, s) => a + s.price, 0);
    return [
      { n: list.length, l: "Total annonces", c: "blue", icon: <I d="M3 9l1.6-5h14.8L21 9M4 9h16v10a1 1 0 01-1 1H5a1 1 0 01-1-1V9z" /> },
      { n: list.length - sold, l: "Disponible à la vente", c: "green", icon: <I d="M20 6L9 17l-5-5" /> },
      { n: sold, l: "Vendue", c: "red", icon: <I d="M18 6 6 18M6 6l12 12" /> },
      { n: nf(stock) + " DA", l: "Valeur du stock disponible", c: "indigo", icon: <I d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /> },
    ];
  }, [sales]);

  if (!sales) return <Spinner />;

  const toggle = async (s: Sale) => { await api.setSold(s.id, !s.sold); toast(!s.sold ? "Marquée comme vendue" : "Remise en vente"); load(); };
  const del = async (s: Sale) => { if (confirm("Supprimer cette annonce ?")) { await api.deleteSale(s.id); toast("Annonce supprimée"); load(); } };

  const actions = (s: Sale) => (
    <div className="flex flex-wrap gap-1.5">
      <Link to={`/car/${s.id}`} target="_blank" className="btn btn-sm">Aperçu</Link>
      <button className="btn btn-sm" onClick={() => toggle(s)}>{s.sold ? "Annuler la vente" : "Marquer vendue"}</button>
      <Link to={`/admin/sales/${s.id}/edit`} className="btn btn-sm">Modifier</Link>
      <button className="btn btn-danger btn-sm" onClick={() => del(s)}>Supprimer</button>
    </div>
  );

  const statusPill = (s: Sale) => (
    <span className={`pill ${s.sold ? "bg-dangerbg text-danger" : "bg-okbg text-ok"}`}>{s.sold ? "Vendue" : "Disponible"}</span>
  );

  return (
    <>
      <PageHead
        title="Voitures à vendre"
        subtitle="Ajoutez et modifiez les voitures de la vitrine publique — et marquez celles qui sont vendues."
        action={
          <div className="flex flex-wrap gap-2">
            <a href="/" target="_blank" rel="noreferrer" className="btn">Vitrine publique</a>
            <Link to="/admin/sales/new" className="btn btn-primary">+ Ajouter une voiture</Link>
          </div>
        }
      />
      <KpiRow items={kpis} />

      {sales.length === 0 ? (
        <div className="card py-14 text-center text-muted">Aucune voiture en vente pour le moment.</div>
      ) : (
        <>
          {/* mobile: cards */}
          <div className="space-y-3 md:hidden">
            {sales.map((s) => (
              <div key={s.id} className="card p-3">
                <div className="flex gap-3">
                  {s.images[0] ? <img src={imgUrl(s.images[0])} className="h-20 w-28 flex-none rounded-lg border border-line object-cover" /> : <div className="grid h-20 w-28 flex-none place-items-center rounded-lg bg-line2 text-xs text-muted">—</div>}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <b className="truncate">{s.title}</b>
                      {statusPill(s)}
                    </div>
                    <div className="mt-0.5 text-brand font-extrabold">{money(s.price)}</div>
                    <div className="text-xs text-muted">{s.year || "—"} · {s.wilaya}</div>
                  </div>
                </div>
                <div className="mt-3 border-t border-line2 pt-3">{actions(s)}</div>
              </div>
            ))}
          </div>

          {/* desktop: table */}
          <div className="card hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="bg-line2 text-left text-xs font-bold text-muted">
                    <Th>Photo</Th><Th>Titre</Th><Th>Prix</Th><Th>Année</Th><Th>Statut</Th><Th> </Th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s) => (
                    <tr key={s.id} className="border-b border-line2 last:border-0 hover:bg-line2">
                      <Td>{s.images[0] ? <img src={imgUrl(s.images[0])} className="h-11 w-16 rounded-lg border border-line object-cover" /> : "—"}</Td>
                      <Td><b>{s.title}</b><br /><span className="text-xs text-muted">{s.wilaya}</span></Td>
                      <Td><b>{money(s.price)}</b></Td>
                      <Td>{s.year || "—"}</Td>
                      <Td>{statusPill(s)}</Td>
                      <Td>{actions(s)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}

const Th = ({ children }: any) => <th className="px-4 py-4 text-left font-bold">{children}</th>;
const Td = ({ children }: any) => <td className="px-4 py-3.5 text-left align-middle">{children}</td>;
const I = ({ d }: { d: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-full w-full"><path d={d} /></svg>;
