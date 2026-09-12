import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

// Página principal crítica cargada directamente para evitar demoras
import SearchItems from "./pages/items/SearchItems";

// Rutas secundarias divididas con Code Splitting
const Login = lazy(() => import("./pages/auth/Login/Login"));
const Register = lazy(() => import("./pages/auth/Register/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword/ResetPassword"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const PublishItem = lazy(() => import("./pages/items/PublishItem"));
const Profile = lazy(() => import("./pages/usuario/Profile"));
const ValidateMaterial = lazy(() => import("./pages/funcionalidades/ValidateMaterial"));
const ItemDetail = lazy(() => import("./pages/items/ItemDetail"));
const Educational = lazy(() => import("./pages/educacion/Educational"));
const AdminUserManagement = lazy(() => import("./pages/admin/AdminUserManagement"));
const AdminRecyclingPoints = lazy(() => import("./pages/admin/AdminRecyclingPoints"));
const Agenda = lazy(() => import("./pages/agenda/Agenda"));
const Historial = lazy(() => import("./pages/historial/Historial"));
const NotFound = lazy(() => import("./pages/notFound/NotFound"));

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
    <div style={{ width: 32, height: 32, border: '3px solid #0F6E56', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
  </div>
);

function App() {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route path="/" element={<Navigate to="/search" replace />} />

                {/* Rutas públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/search" element={<SearchItems />} />
                <Route path="/items/:id" element={<ItemDetail />} />
                <Route path="/educational" element={<Educational />} />

                {/* Rutas protegidas generales */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/publish" element={<PublishItem />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/agenda" element={<Agenda />} />
                    <Route path="/historial" element={<Historial />} />
                </Route>

                {/* Rutas protegidas para Gestores y Administradores */}
                <Route element={<RoleRoute allowedRoles={['gestor', 'admin', 'coordinador']} />}>
                    <Route path="/validate" element={<ValidateMaterial />} />
                    <Route path="/admin/recycling-points" element={<AdminRecyclingPoints />} />
                </Route>

                {/* Rutas protegidas exclusivas para Administradores */}
                <Route element={<RoleRoute allowedRoles={['admin']} />}>
                    <Route path="/admin/users" element={<AdminUserManagement />} />
                </Route>

                {/* Ruta 404 para rutas inexistentes (P-020) */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
}

export default App;