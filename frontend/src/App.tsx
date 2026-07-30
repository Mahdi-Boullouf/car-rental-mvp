import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Landing from "./pages/public/Landing";
import Storefront from "./pages/public/Storefront";
import CarDetails from "./pages/public/CarDetails";
import Login from "./pages/admin/Login";
import AdminLayout from "./components/admin/AdminLayout";
import Agencies from "./pages/admin/Agencies";
import AgencyForm from "./pages/admin/AgencyForm";
import Fleet from "./pages/admin/Fleet";
import CarForm from "./pages/admin/CarForm";
import BookingForm from "./pages/admin/BookingForm";
import Bookings from "./pages/admin/Bookings";
import SalesAdmin from "./pages/admin/SalesAdmin";
import SaleForm from "./pages/admin/SaleForm";
import SettingsAdmin from "./pages/admin/SettingsAdmin";

function Protected({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center text-muted">Chargement…</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}

function SuperOnly({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (user?.role !== "SUPER_ADMIN") return <Navigate to="/admin" replace />;
  return children;
}

function AdminHome() {
  const { user } = useAuth();
  if (user?.role === "SUPER_ADMIN") return <Navigate to="/admin/agencies" replace />;
  if (user?.agency?.rentalsEnabled) return <Navigate to="/admin/fleet" replace />;
  return <Navigate to="/admin/sales" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Platform + public showrooms */}
      <Route path="/" element={<Landing />} />
      <Route path="/admin/login" element={<Login />} />

      {/* Admin (super-admin console OR agency dashboard) */}
      <Route path="/admin" element={<Protected><AdminLayout /></Protected>}>
        <Route index element={<AdminHome />} />
        {/* super-admin */}
        <Route path="agencies" element={<SuperOnly><Agencies /></SuperOnly>} />
        <Route path="agencies/new" element={<SuperOnly><AgencyForm /></SuperOnly>} />
        {/* agency owner */}
        <Route path="fleet" element={<Fleet />} />
        <Route path="fleet/new" element={<CarForm />} />
        <Route path="fleet/:id/edit" element={<CarForm />} />
        <Route path="fleet/:id/book" element={<BookingForm />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="sales" element={<SalesAdmin />} />
        <Route path="sales/new" element={<SaleForm />} />
        <Route path="sales/:id/edit" element={<SaleForm />} />
        <Route path="settings" element={<SettingsAdmin />} />
      </Route>

      {/* Public showroom by slug */}
      <Route path="/:slug" element={<Storefront />} />
      <Route path="/:slug/car/:id" element={<CarDetails />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
