import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PublicHeader from "../../components/PublicHeader";
import { api, imgUrl } from "../../lib/api";
import { money, nf } from "../../lib/format";
import type { PublicAgency, Sale } from "../../types";

export default function CarDetails() {
  const { slug, id } = useParams();
  const [agency, setAgency] = useState<PublicAgency | null>(null);
  const [sale, setSale] = useState<Sale | null | undefined>(undefined);
  const [main, setMain] = useState(0);

  useEffect(() => {
    if (!slug || !id) return;
    setSale(undefined);
    setMain(0);
    api.publicAgency(slug).then(setAgency).catch(() => {});
    api.publicSale(slug, id).then(setSale).catch(() => setSale(null));
  }, [slug, id]);

  const header = <PublicHeader name={agency?.name} logo={agency?.logo} slug={slug} />;

  if (sale === undefined)
    return (
      <div className="min-h-screen">
        {header}
        <div className="mx-auto max-w-[1180px] px-4 py-8 md:px-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="skeleton aspect-[16/10] rounded-2xl" />
            <div className="skeleton h-56 rounded-2xl" />
          </div>
        </div>
      </div>
    );

  if (sale === null)
    return (
      <div className="min-h-screen">
        {header}
        <div className="mx-auto max-w-[1180px] px-4 py-10 md:px-6">
          <Link to={`/${slug}`} className="text-muted hover:text-ink">← Retour</Link>
          <p className="mt-4">Annonce introuvable.</p>
        </div>
      </div>
    );

  const imgs = sale.images.length ? sale.images : [];
  const waPhone = "213" + (sale.phone || "").replace(/\D/g, "").replace(/^0/, "");
  const specs: [string, any][] = [
    ["Marque", sale.brand], ["Modèle", sale.model], ["Année", sale.year],
    ["Kilométrage", sale.km != null ? `${nf(sale.km)} km` : "—"],
    ["Carburant", sale.fuel], ["Boîte de vitesses", sale.gearbox], ["Couleur", sale.color],
    ["Statut", sale.sold ? "Vendue" : "Disponible"],
  ];

  return (
    <div className="min-h-screen">
      {header}
      <div className="mx-auto max-w-[1180px] px-4 pb-20 pt-5 md:px-6">
        <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted">
          <Link to={`/${slug}`} className="font-semibold hover:text-ink">{agency?.name || "Vitrine"}</Link>
          <span className="text-line">/</span>
          <span className="line-clamp-1 text-ink2">{sale.title}</span>
        </nav>

        <div className="animate-fadeup grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="lg:col-start-1 lg:row-start-1">
            <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
              <div className="relative aspect-[16/10] bg-line2">
                {imgs[main] ? (
                  <img src={imgUrl(imgs[main])} alt={sale.title} className={`h-full w-full object-cover ${sale.sold ? "grayscale-[.55] brightness-95" : ""}`} />
                ) : <div className="grid h-full w-full place-items-center text-sm text-muted">Aucune photo</div>}
                {sale.sold && <span className="absolute start-4 top-4 rounded-lg bg-ink/85 px-4 py-1.5 text-sm font-extrabold text-white backdrop-blur">Vendue</span>}
              </div>
              {imgs.length > 1 && (
                <div className="flex gap-2 overflow-x-auto p-2.5">
                  {imgs.map((im, i) => (
                    <button key={i} onClick={() => setMain(i)}
                      className={`h-16 w-[92px] flex-none overflow-hidden rounded-lg border-2 transition ${i === main ? "border-brand" : "border-transparent opacity-70 hover:opacity-100"}`}>
                      <img src={imgUrl(im)} className="h-full w-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="flex flex-col gap-4 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-start lg:sticky lg:top-20">
            <div className="rounded-2xl border border-line bg-white p-5 shadow-soft md:p-6">
              <h1 className="text-lg font-extrabold leading-snug">{sale.title}</h1>
              <div className="mt-2 text-[30px] font-extrabold leading-none text-ink">{money(sale.price)}</div>
              <div className="mt-3">{sale.sold ? <span className="pill bg-dangerbg text-danger">Vendue</span> : <span className="pill bg-okbg text-ok">Disponible à la vente</span>}</div>
              <div className="mt-3 flex items-center gap-1.5 text-[13px] text-muted">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-6.3-7-11a7 7 0 0114 0c0 4.7-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
                {sale.wilaya || "Algérie"}
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-white p-5 shadow-soft md:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-grad-brand text-sm font-extrabold text-white">{(agency?.name || "MC").slice(0, 2).toUpperCase()}</div>
                <div>
                  <b className="text-[15px]">{agency?.name || "Vitrine"}</b>
                  <small className="block text-[12.5px] text-muted">{agency?.city || sale.wilaya || "Algérie"}</small>
                </div>
              </div>
              {sale.sold ? (
                <div className="rounded-xl bg-line2 px-4 py-3.5 text-center font-semibold text-muted">Cette voiture a été vendue</div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <a href={`tel:${(sale.phone || "").replace(/\s/g, "")}`} className="btn btn-primary w-full">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.5-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7a2 2 0 0 1 1.7 2z" /></svg>
                    Appeler: {sale.phone || "—"}
                  </a>
                  <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noreferrer" className="btn w-full border-transparent bg-[#25d366] text-white hover:brightness-105">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.7.8-2.7-.2-.3A8 8 0 1 1 12 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.5 6.5 0 0 1-1.9-1.2 7.2 7.2 0 0 1-1.3-1.7c-.1-.2 0-.4.1-.5l.4-.5.2-.3v-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3A2.8 2.8 0 0 0 6 8.9c0 1.7 1.2 3.3 1.4 3.5s2.4 3.7 5.8 5.1a6.6 6.6 0 0 0 2.6.6 2.2 2.2 0 0 0 1.4-1 1.8 1.8 0 0 0 .1-1c0-.2-.2-.3-.5-.4z" /></svg>
                    WhatsApp
                  </a>
                </div>
              )}
            </div>
          </aside>

          <div className="space-y-5 lg:col-start-1 lg:row-start-2">
            <div className="rounded-2xl border border-line bg-white p-5 shadow-soft md:p-6">
              <h3 className="mb-4 text-base font-extrabold">Caractéristiques</h3>
              <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                {specs.map(([l, v], i) => (
                  <div key={i} className="flex items-center justify-between border-b border-line2 py-3 text-sm">
                    <span className="text-muted">{l}</span><b className="font-bold">{v === 0 || v ? v : "—"}</b>
                  </div>
                ))}
              </div>
            </div>
            {sale.description && (
              <div className="rounded-2xl border border-line bg-white p-5 shadow-soft md:p-6">
                <h3 className="mb-3 text-base font-extrabold">Description</h3>
                <p className="whitespace-pre-wrap leading-8 text-ink2">{sale.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
