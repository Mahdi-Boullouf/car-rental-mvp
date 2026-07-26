import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../../components/PublicHeader";
import { api, imgUrl } from "../../lib/api";
import { useSettings } from "../../lib/useSettings";
import { money, nf } from "../../lib/format";
import type { Sale } from "../../types";

type Sort = "recent" | "price_asc" | "price_desc";

export default function Storefront() {
  const settings = useSettings();
  const cover = settings?.cover;
  const [sales, setSales] = useState<Sale[] | null>(null);
  const [q, setQ] = useState("");
  const [fuel, setFuel] = useState("all");
  const [sort, setSort] = useState<Sort>("recent");

  useEffect(() => {
    api.sales().then(setSales).catch(() => setSales([]));
  }, []);

  const fuels = useMemo(
    () => Array.from(new Set((sales || []).map((s) => s.fuel).filter(Boolean))) as string[],
    [sales]
  );

  const list = useMemo(() => {
    let r = [...(sales || [])];
    const s = q.trim().toLowerCase();
    if (s) r = r.filter((x) => x.title.toLowerCase().includes(s) || (x.wilaya || "").toLowerCase().includes(s));
    if (fuel !== "all") r = r.filter((x) => x.fuel === fuel);
    if (sort === "price_asc") r.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") r.sort((a, b) => b.price - a.price);
    return r;
  }, [sales, q, fuel, sort]);

  const available = sales?.filter((s) => !s.sold).length ?? 0;

  return (
    <div className="min-h-screen">
      <PublicHeader />

      {/* Cover (only if the owner set one) — full-bleed photo, subtle photographic scrim */}
      {cover && (
        <div className="mx-auto max-w-[1180px] px-4 md:px-6">
          <div className="relative mt-5 h-[200px] overflow-hidden rounded-2xl md:h-[300px]">
            <img src={imgUrl(cover)} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 p-6 md:p-8">
              <h1 className="text-3xl font-extrabold text-white md:text-4xl">سيارات للبيع</h1>
              <p className="mt-1 text-white/85">{available} سيارة متوفرة</p>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[1180px] px-4 pb-20 pt-6 md:px-6 md:pt-8">
        {!cover && (
          <div className="mb-6">
            <h1 className="text-[30px] font-extrabold tracking-tight md:text-[38px]">سيارات للبيع</h1>
            <p className="mt-1 text-muted">{available} سيارة متوفرة في معرض ماستر كارز</p>
          </div>
        )}

        {/* Toolbar: search + fuel filter + sort */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-line bg-white p-3 shadow-soft md:flex-row md:items-center">
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-muted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث بالاسم أو الولاية…"
              className="w-full rounded-xl border border-line bg-[#f7f8fa] py-2.5 ps-11 pe-3 text-[15px] outline-none transition focus:border-brand focus:bg-white focus:shadow-[0_0_0_3px_rgba(47,107,255,.14)]"
            />
          </div>

          <div className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-0.5">
            <Pill active={fuel === "all"} onClick={() => setFuel("all")}>الكل</Pill>
            {fuels.map((f) => (
              <Pill key={f} active={fuel === f} onClick={() => setFuel(f)}>{f}</Pill>
            ))}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-xl border border-line bg-[#f7f8fa] px-3 py-2.5 text-sm font-semibold text-ink2 outline-none focus:border-brand"
          >
            <option value="recent">الأحدث</option>
            <option value="price_asc">السعر: الأقل أولاً</option>
            <option value="price_desc">السعر: الأعلى أولاً</option>
          </select>
        </div>

        {/* Grid */}
        {sales === null ? (
          <Grid>{Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}</Grid>
        ) : list.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white py-20 text-center text-muted">لا توجد سيارات مطابقة لبحثك.</div>
        ) : (
          <Grid>{list.map((s, i) => <CarCard key={s.id} sale={s} index={i} />)}</Grid>
        )}
      </main>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function CarCard({ sale: s, index }: { sale: Sale; index: number }) {
  return (
    <Link
      to={`/car/${s.id}`}
      className="animate-fadeup group block overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition-all duration-300 will-change-transform hover:-translate-y-1 hover:shadow-lg2"
      style={{ animationDelay: `${Math.min(index, 11) * 55}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-line2">
        {s.images[0] ? (
          <img
            src={imgUrl(s.images[0])}
            alt={s.title}
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06] ${s.sold ? "grayscale-[.6] brightness-90" : ""}`}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-sm text-muted">لا توجد صورة</div>
        )}
        {s.sold && (
          <span className="absolute start-3 top-3 rounded-lg bg-ink/85 px-3 py-1 text-xs font-bold text-white backdrop-blur">مباعة</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 text-[15.5px] font-bold leading-snug">{s.title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
          {[s.year, s.km != null ? `${nf(s.km)} كم` : null, s.fuel, s.gearbox].filter(Boolean).map((t, i, arr) => (
            <span key={i} className="flex items-center gap-2">
              {t}
              {i < arr.length - 1 && <span className="text-line">•</span>}
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-line2 pt-3">
          <div className="text-lg font-extrabold text-ink">{money(s.price)}</div>
          <span className="flex items-center gap-1 text-[12.5px] text-muted">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-6.3-7-11a7 7 0 0114 0c0 4.7-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
            {s.wilaya || "الجزائر"}
          </span>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
      <div className="skeleton aspect-[4/3]" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton mt-2 h-5 w-2/5 rounded" />
      </div>
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-[13px] font-bold transition ${
        active ? "bg-ink text-white" : "bg-[#f7f8fa] text-ink2 hover:bg-line2"
      }`}
    >
      {children}
    </button>
  );
}
