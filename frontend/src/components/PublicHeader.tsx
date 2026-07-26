import { Link } from "react-router-dom";
import { imgUrl } from "../lib/api";
import { useSettings } from "../lib/useSettings";

export default function PublicHeader() {
  const settings = useSettings();
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-line bg-white/90 px-4 py-3 backdrop-blur md:px-6">
      {/* Brand at the start */}
      <Link to="/" className="flex items-center gap-2.5">
        {settings?.logo ? (
          <img src={imgUrl(settings.logo)} alt="Master Cars" className="h-10 w-auto max-w-[150px] object-contain" />
        ) : (
          <>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-grad-brand text-sm font-extrabold text-white shadow-[0_6px_18px_rgba(47,107,255,.4)]">MC</div>
            <div className="leading-tight">
              <span className="block text-[16px] font-extrabold">Master Cars</span>
              <span className="hidden text-[11px] text-muted sm:block">معرض السيارات — الجزائر</span>
            </div>
          </>
        )}
      </Link>

      <Link to="/admin" className="btn btn-sm">لوحة التحكم</Link>
    </header>
  );
}
