import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItem =
  "flex items-center gap-3 rounded-xl px-3.5 py-3 text-[14.5px] font-semibold transition min-h-[44px]";

function Item({ to, end, icon, label, onClick }: any) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `${navItem} ${isActive ? "bg-grad-brand text-white shadow-[0_8px_20px_rgba(47,107,255,.4)]" : "text-white/60 hover:bg-white/10 hover:text-white"}`
      }
    >
      <span className="w-5">{icon}</span>
      {label}
    </NavLink>
  );
}

const ic = {
  agencies: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-3M9 9v.01M9 12v.01M9 15v.01" /></svg>,
  fleet: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11m-14 0h14m-14 0v5m14-5v5M7.5 16h.01M16.5 16h.01M5 16h14v2H5z" /></svg>,
  bookings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></svg>,
  sales: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l1.6-5h14.8L21 9M4 9h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9zM4 9a2.4 2.4 0 0 0 4 0 2.4 2.4 0 0 0 4 0 2.4 2.4 0 0 0 4 0 2.4 2.4 0 0 0 4 0" /></svg>,
  settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 4.6 7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" /></svg>,
  store: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 3h6v6M21 3l-9 9M10 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" /></svg>,
};

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const doLogout = () => { logout(); nav("/admin/login"); };

  const isSuper = user?.role === "SUPER_ADMIN";
  const ag = user?.agency;
  const brand = isSuper ? "Plateforme Master Cars" : ag?.name || "Master Cars";
  const sub = isSuper ? "Administration" : "Espace agence";

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-white px-4 py-2.5 md:hidden">
        <button className="btn btn-sm" onClick={() => setOpen(true)} aria-label="Menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <b>{brand}</b>
      </div>

      {open && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={close} />}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col bg-grad-navy p-4 transition-transform md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="flex items-center gap-3 border-b border-white/10 px-2 pb-4">
          <div className="grid h-11 w-11 place-items-center rounded-[13px] bg-grad-brand text-[15px] font-extrabold text-white shadow-[0_6px_18px_rgba(47,107,255,.45)]">
            {isSuper ? "★" : "MC"}
          </div>
          <div>
            <h1 className="text-[15px] font-extrabold text-white line-clamp-1">{brand}</h1>
            <small className="text-[11.5px] text-white/50">{sub}</small>
          </div>
        </div>

        {isSuper ? (
          <>
            <div className="px-2.5 pb-2 pt-4 text-[11px] font-bold tracking-wider text-white/40">Administration</div>
            <nav className="flex flex-col gap-1">
              <Item to="/admin/agencies" icon={ic.agencies} label="Agences" onClick={close} />
            </nav>
          </>
        ) : (
          <>
            {ag?.rentalsEnabled && (
              <>
                <div className="px-2.5 pb-2 pt-4 text-[11px] font-bold tracking-wider text-white/40">Location</div>
                <nav className="flex flex-col gap-1">
                  <Item to="/admin/fleet" icon={ic.fleet} label="Flotte" onClick={close} />
                  <Item to="/admin/bookings" icon={ic.bookings} label="Réservations" onClick={close} />
                </nav>
              </>
            )}
            {ag?.salesEnabled && (
              <>
                <div className="px-2.5 pb-2 pt-4 text-[11px] font-bold tracking-wider text-white/40">Boutique</div>
                <nav className="flex flex-col gap-1">
                  <Item to="/admin/sales" icon={ic.sales} label="Voitures à vendre" onClick={close} />
                  <Item to="/admin/settings" icon={ic.settings} label="Paramètres de la vitrine" onClick={close} />
                  <a href={`/${ag.slug}`} target="_blank" rel="noreferrer" className={`${navItem} text-white/60 hover:bg-white/10 hover:text-white`}>
                    <span className="w-5">{ic.store}</span> Vitrine publique
                  </a>
                </nav>
              </>
            )}
          </>
        )}

        <div className="mt-auto rounded-2xl bg-white/[.06] p-3.5 text-white/60">
          <b className="block text-[13px] text-white">{user?.name}</b>
          <span className="text-[12px]">{user?.email}</span>
          <button onClick={doLogout} className="mt-3 w-full rounded-lg bg-white/10 px-3 py-2 text-[13px] font-bold text-white hover:bg-white/20">
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="px-5 pb-16 pt-6 md:ml-[264px] md:px-9">
        <div className="mx-auto max-w-[1240px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
