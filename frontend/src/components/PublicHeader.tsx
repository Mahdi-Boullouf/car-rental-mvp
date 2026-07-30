import { Link } from "react-router-dom";
import { imgUrl } from "../lib/api";

export default function PublicHeader({ name, logo, slug }: { name?: string; logo?: string | null; slug?: string }) {
  const home = slug ? `/${slug}` : "/";
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-line bg-white/90 px-4 py-3 backdrop-blur md:px-6">
      <Link to={home} className="flex items-center gap-2.5">
        {logo ? (
          <img src={imgUrl(logo)} alt={name || "showroom"} className="h-10 w-auto max-w-[150px] object-contain" />
        ) : (
          <>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-grad-brand text-sm font-extrabold text-white shadow-[0_6px_18px_rgba(47,107,255,.4)]">
              {(name || "MC").slice(0, 2).toUpperCase()}
            </div>
            <span className="text-[16px] font-extrabold">{name || "Master Cars"}</span>
          </>
        )}
      </Link>
    </header>
  );
}
