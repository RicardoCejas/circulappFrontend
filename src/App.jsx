import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

import Login from "./pages/auth/Login/Login";
import Register from "./pages/auth/Register/Register";
import ForgotPassword from "./pages/auth/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword/ResetPassword";
import Dashboard from "./pages/dashboard/Dashboard";
import PublishItem from "./pages/items/PublishItem";
import Profile from "./pages/usuario/Profile";
import SearchItems from "./pages/items/SearchItems";
import ValidateMaterial from "./pages/funcionalidades/ValidateMaterial";
import ItemDetail from "./pages/items/ItemDetail";
import Educational from "./pages/educacion/Educational";
import AdminUserManagement from "./pages/admin/AdminUserManagement";
import AdminRecyclingPoints from "./pages/admin/AdminRecyclingPoints";
import Agenda from "./pages/agenda/Agenda";
import Historial from "./pages/historial/Historial";
import NotFound from "./pages/notFound/NotFound";

function App() {
    return (
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
    );
}

export default App;