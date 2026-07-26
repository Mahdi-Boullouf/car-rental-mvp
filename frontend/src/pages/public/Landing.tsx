import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-grad-brand text-xl font-extrabold text-white shadow-[0_12px_30px_rgba(47,107,255,.45)]">MC</div>
        <h1 className="text-3xl font-extrabold tracking-tight">Master Cars</h1>
        <p className="mt-2 text-muted">منصة إدارة معارض وتأجير السيارات — لكل وكالة لوحتها الخاصة وصفحتها العامة.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/admin/login" className="btn btn-primary">لوحة التحكم</Link>
        </div>
        <p className="mt-6 text-xs text-muted">تجريبي: super@mastercars.dz للإدارة، أو admin@mastercars.dz لوكالة.</p>
      </div>
    </div>
  );
}
