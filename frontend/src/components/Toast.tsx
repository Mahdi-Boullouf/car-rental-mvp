import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

const Ctx = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const toast = useCallback((m: string) => {
    setMsg(m);
    window.setTimeout(() => setMsg(null), 2600);
  }, []);
  return (
    <Ctx.Provider value={toast}>
      {children}
      <div
        className={`pointer-events-none fixed bottom-6 left-1/2 z-[99] -translate-x-1/2 rounded-xl bg-navy-900 px-6 py-3 text-sm font-bold text-white shadow-lg2 transition-all ${
          msg ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"
        }`}
      >
        {msg}
      </div>
    </Ctx.Provider>
  );
}
