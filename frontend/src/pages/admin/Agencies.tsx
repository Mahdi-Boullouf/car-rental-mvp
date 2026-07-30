import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { fmtDate } from "../../lib/format";
import type { Agency } from "../../types";
import { KpiRow, PageHead, Spinner } from "../../components/ui";
import { useToast } from "../../components/Toast";

export default function Agencies() {
  const toast = useToast();
  const [list, setList] = useState<Agency[] | null>(null);
  const load = () => api.agencies().then(setList);
  useEffect(() => { load(); }, []);

  const kpis = useMemo(() => {
    const a = list || [];
    return [
      { n: a.length, l: "Total agences", c: "blue", icon: <I d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-3" /> },
      { n: a.filter((x) => x.active).length, l: "Active", c: "green", icon: <I d="M20 6L9 17l-5-5" /> },
      { n: a.reduce((s, x) => s + x.cars, 0), l: "Voitures de location", c: "indigo", icon: <I d="M5 11l1.5-4.5h11L19 11H5zm0 0v5m14-5v5" /> },
      { n: a.reduce((s, x) => s + x.sales, 0), l: "Annonces de vente", c: "red", icon: <I d="M3 9l1.6-5h14.8L21 9M4 9h16v11H4z" /> },
    ];
  }, [list]);

  if (!list) return <Spinner />;

  const toggle = async (a: Agency) => { await api.updateAgency(a.id, { active: !a.active }); toast(!a.active ? "Activée" : "Suspendue"); load(); };
  const del = async (a: Agency) => { if (confirm(`Supprimer l'agence "${a.name}" et toutes ses données ?`)) { await api.deleteAgency(a.id); toast("Supprimée"); load(); } };

  const modules = (a: Agency) => (
    <div className="flex flex-wrap gap-1.5">
      {a.rentalsEnabled && <span className="pill bg-[#ecebfd] text-[#4f46e5]">Location</span>}
      {a.salesEnabled && <span className="pill bg-okbg text-ok">Vente</span>}
      {!a.rentalsEnabled && !a.salesEnabled && <span className="pill bg-line2 text-muted">—</span>}
    </div>
  );

  const actions = (a: Agency) => (
    <div className="flex flex-wrap gap-1.5">
      <a href={`/${a.slug}`} target="_blank" rel="noreferrer" className="btn btn-sm">Vitrine</a>
      <button className="btn btn-sm" onClick={() => toggle(a)}>{a.active ? "Suspendre" : "Activer"}</button>
      <button className="btn btn-danger btn-sm" onClick={() => del(a)}>Supprimer</button>
    </div>
  );

  return (
    <>
      <PageHead
        title="Agences"
        subtitle="Créez un compte agence, activez les modules voulus et remettez les identifiants au propriétaire."
        action={<Link to="/admin/agencies/new" className="btn btn-primary">+ Ajouter une agence</Link>}
      />
      <KpiRow items={kpis} />

      {list.length === 0 ? (
        <div className="card py-14 text-center text-muted">Aucune agence. Créez la première.</div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {list.map((a) => (
              <div key={a.id} className="card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <b>{a.name}</b>
                    <div className="text-xs text-muted">/{a.slug} · {a.city || "—"}</div>
                  </div>
                  <span className={`pill ${a.active ? "bg-okbg text-ok" : "bg-dangerbg text-danger"}`}>{a.active ? "Active" : "Suspendue"}</span>
                </div>
                <div className="mt-2 text-[13px] text-muted">Propriétaire: {a.ownerEmail}</div>
                <div className="mt-2 flex items-center justify-between">{modules(a)}<span className="text-xs text-muted">{a.cars} Location · {a.sales} Vente</span></div>
                <div className="mt-3 border-t border-line2 pt-3">{actions(a)}</div>
              </div>
            ))}
          </div>

          <div className="card hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-sm">
                <thead>
                  <tr className="bg-line2 text-left text-xs font-bold text-muted">
                    <Th>Agence</Th><Th>Propriétaire</Th><Th>Modules</Th><Th>Données</Th><Th>Statut</Th><Th>Créée</Th><Th> </Th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((a) => (
                    <tr key={a.id} className="border-b border-line2 last:border-0 hover:bg-line2">
                      <Td><b>{a.name}</b><br /><span className="text-xs text-muted">/{a.slug} · {a.city || "—"}</span></Td>
                      <Td>{a.ownerEmail}</Td>
                      <Td>{modules(a)}</Td>
                      <Td className="text-muted">{a.cars} Location · {a.sales} Vente</Td>
                      <Td><span className={`pill ${a.active ? "bg-okbg text-ok" : "bg-dangerbg text-danger"}`}>{a.active ? "Active" : "Suspendue"}</span></Td>
                      <Td className="text-muted">{fmtDate(a.createdAt)}</Td>
                      <Td>{actions(a)}</Td>
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
const Td = ({ children, className = "" }: any) => <td className={`px-4 py-3.5 text-left align-middle ${className}`}>{children}</td>;
const I = ({ d }: { d: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-full w-full"><path d={d} /></svg>;
