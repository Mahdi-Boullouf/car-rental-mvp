import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@mastercars.dz");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await login(email.trim(), password);
      nav("/admin");
    } catch (e: any) {
      setErr(e.message || "فشل تسجيل الدخول");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center p-5">
      <div className="w-full max-w-[400px]">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-grad-brand text-lg font-extrabold text-white shadow-[0_10px_26px_rgba(47,107,255,.45)]">MC</div>
          <div>
            <h1 className="text-xl font-extrabold">Master Cars</h1>
            <p className="text-sm text-muted">لوحة التحكم — تسجيل الدخول</p>
          </div>
        </div>
        <form onSubmit={submit} className="card p-6">
          <label className="label" htmlFor="email">البريد الإلكتروني</label>
          <input id="email" className="input mb-4" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
          <label className="label" htmlFor="pw">كلمة المرور</label>
          <input id="pw" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="••••••••" required />
          {err && <div className="mt-4 rounded-xl border border-[#f6c9d3] bg-dangerbg px-4 py-3 text-sm text-[#9f1239]">{err}</div>}
          <button className="btn btn-primary mt-6 w-full" disabled={busy}>{busy ? "جارٍ الدخول…" : "دخول"}</button>
          <p className="mt-4 text-center text-xs text-muted">تجريبي: admin@mastercars.dz / admin123</p>
        </form>
      </div>
    </div>
  );
}
