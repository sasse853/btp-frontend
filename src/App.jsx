import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';
import Layout from './components/Layout';

import Login from './pages/auth/Login';

import AdminDashboard from './pages/admin/Dashboard';
import AdminChantiers from './pages/admin/Chantiers';
import AdminValidations from './pages/admin/Validations';
import AdminRapports from './pages/admin/Rapports';

import ChefDashboard from './pages/chef/Dashboard';
import ChefChantiers from './pages/chef/Chantiers';
import ChefPresences from './pages/chef/Presences';
import AdminUtilisateurs from './pages/admin/Utilisateurs';
import MonProfil from './pages/MonProfil';



import ChantierDetail from './pages/ChantierDetail';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        {/* Espace administrateur */}
        <Route element={<RoleGuard role="admin" />}>
          <Route path="/admin" element={<Layout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="chantiers" element={<AdminChantiers />} />
            <Route path="chantiers/:id" element={<ChantierDetail mode="admin" />} />
            <Route path="validations" element={<AdminValidations />} />
            <Route path="rapports" element={<AdminRapports />} />
            <Route path="utilisateurs" element={<AdminUtilisateurs />} />
            <Route path="profil" element={<MonProfil />} />

          </Route>
        </Route>

        {/* Espace chef de chantier */}
        <Route element={<RoleGuard role="chef_chantier" />}>
          <Route path="/chef" element={<Layout />}>
            <Route index element={<ChefDashboard />} />
            <Route path="chantiers" element={<ChefChantiers />} />
            <Route path="chantiers/:id" element={<ChantierDetail mode="chef" />} />
            <Route path="presences" element={<ChefPresences />} />
            <Route path="profil" element={<MonProfil />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
