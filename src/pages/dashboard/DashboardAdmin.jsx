import { useState } from "react";
import Layout from "../../components/layout/Layout";
import ErrorToast from "../../components/feedback/ErrorToast";
import HeroBanner from "../../components/dashboard/HeroBanner";
import StatCard from "../../components/dashboard/StatCard";
import SectionCard from "../../components/dashboard/SectionCard";
import { IconBox, IconCheck, IconPackage, IconChevron } from "../../components/Icons";
import IconReport from "../icons/IconReport";
import IconUsers from "../icons/IconUsers";

import useDashboardAdmin from "./hooks/useDashboardAdmin";
import AdminUsersTable from "./components/AdminUsersTable";
import ReportModerationList from "../../components/dashboard/ReportModerationList";
import AdminReportModal from "../../components/dashboard/AdminReportModal";
import AdminFeedbackList from "../../components/dashboard/AdminFeedbackList";
import { ADMIN_REPORTS } from "./data/dashboardData";

const DashboardAdmin = () => {
  const [selectedReportModal, setSelectedReportModal] = useState(null);
  const { 
    user, 
    navigate, 
    error, 
    clearError, 
    metrics, 
    users, 
    items, 
    reports,
    pendingReportsCount,
    loadingReports,
    actionLoadingId,
    handlePromote, 
    handleToggleActive, 
    handleDismissReport,
    handleDeleteReportedItem,
    handleDeactivateReportedUser,
    exportarItems
  } = useDashboardAdmin();

  if (!user || (user.role !== "admin" && user.role !== "dev" && !user.isDev)) return null;

  return (
    <Layout>
      <ErrorToast error={error} onClose={clearError} />

      <div className="pt-20 pb-10 px-5 min-h-screen bg-gray-50">
        <div className="max-w-[980px] mx-auto">
          <HeroBanner title="Panel de Administración" subtitle="Gestión centralizada de usuarios, materiales y reportes." impactLabel="CO₂ Ahorrado" impactScore={`${metrics.co2Saved} kg`} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-7">
            <StatCard label="Usuarios" value={metrics.totalUsers} sub="registrados" accentColor="border-emerald-500" iconBg="bg-emerald-500/10" iconColor="text-emerald-600" icon={<IconUsers />} />
            <StatCard label="Materiales" value={metrics.totalItems} sub="publicados" accentColor="border-amber-500" iconBg="bg-amber-500/10" iconColor="text-amber-600" icon={<IconBox />} />
            <StatCard label="Validados" value={metrics.validatedItems} sub="certificados" accentColor="border-emerald-500" iconBg="bg-emerald-500/10" iconColor="text-emerald-600" icon={<IconCheck />} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard title="Gestión de Usuarios" icon={IconUsers} actionLabel={<>Ver todos <IconChevron /></>} onAction={() => navigate("/admin/users")}>
              <AdminUsersTable users={users} onPromote={handlePromote} onToggleActive={handleToggleActive} />
            </SectionCard>

            <SectionCard title="Trazabilidad de Materiales" icon={IconPackage} actionLabel={<>Exportar <IconChevron /></>} onAction={exportarItems}>
              <div className="flex flex-col gap-1">
                {items.slice(0, 5).map((item) => (
                  <div key={item._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100/70 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-gray-200 flex-shrink-0 flex items-center justify-center"><IconPackage /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate m-0">{item.title}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 m-0">{item.category}</p>
                      <p className="text-[11px] text-gray-400 m-0">Estado: {item.processingState}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="w-full py-2.5 rounded-xl border border-emerald-600/30 text-emerald-600 font-semibold text-xs hover:bg-emerald-50 transition-colors cursor-pointer bg-transparent">
                  Total: {metrics.totalItems} materiales
                </button>
              </div>
            </SectionCard>
          </div>

          {/* Moderación de Denuncias de la Comunidad */}
          <SectionCard 
            title="Moderación de Denuncias" 
            icon={IconReport} 
            className="mt-4"
            actionLabel={
              pendingReportsCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                  {pendingReportsCount} pendientes
                </span>
              ) : null
            }
          >
            <ReportModerationList
              reports={reports}
              loading={loadingReports}
              onDismiss={handleDismissReport}
              onDeleteItem={handleDeleteReportedItem}
              onDeactivateUser={handleDeactivateReportedUser}
              actionLoadingId={actionLoadingId}
            />
          </SectionCard>

          {/* Feedback y Sugerencias de Desarrollo de la Comunidad */}
          <SectionCard 
            title="Feedback y Sugerencias de Desarrollo" 
            icon={IconBox} 
            className="mt-4"
          >
            <AdminFeedbackList />
          </SectionCard>

          <SectionCard title="Reportes para la Comuna" icon={IconReport} className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {ADMIN_REPORTS.map((report) => (
                <div 
                  key={report.title} 
                  onClick={() => setSelectedReportModal(report)} 
                  className="bg-white border border-gray-100 rounded-xl p-4 cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-gray-800 group-hover:text-[#0F6E56] transition-colors">{report.title}</div>
                    <span className="text-xs text-gray-400 group-hover:text-[#0F6E56] font-semibold">Ver ↗</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{report.sub}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Modal de Previsualización y Exportación a Excel de Reportes */}
      <AdminReportModal
        isOpen={Boolean(selectedReportModal)}
        onClose={() => setSelectedReportModal(null)}
        reportInfo={selectedReportModal}
      />
    </Layout>
  );
};

export default DashboardAdmin;