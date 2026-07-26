import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Storefront from "./pages/public/Storefront";
import CarDetails from "./pages/public/CarDetails";
import Login from "./pages/admin/Login";
import AdminLayout from "./components/admin/AdminLayout";
import Fleet from "./pages/admin/Fleet";
import CarForm from "./pages/admin/CarForm";
import BookingForm from "./pages/admin/BookingForm";
import Bookings from "./pages/admin/Bookings";
import SalesAdmin from "./pages/admin/SalesAdmin";
import SaleForm from "./pages/admin/SaleForm";
import SettingsAdmin from "./pages/admin/SettingsAdmin";

function Protected({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center text-muted">جارٍ التحميل…</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public storefront */}
      <Route path="/" element={<Storefront />} />
      <Route path="/car/:id" element={<CarDetails />} />

      {/* Admin */}
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <Protected>
            <AdminLayout />
          </Protected>
        }
      >
        <Route index element={<Fleet />} />
        <Route path="fleet/new" element={<CarForm />} />
        <Route path="fleet/:id/edit" element={<CarForm />} />
        <Route path="fleet/:id/book" element={<BookingForm />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="sales" element={<SalesAdmin />} />
        <Route path="sales/new" element={<SaleForm />} />
        <Route path="sales/:id/edit" element={<SaleForm />} />
        <Route path="settings" element={<SettingsAdmin />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
