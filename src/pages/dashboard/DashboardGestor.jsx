import Layout from "../../components/layout/Layout";
import HeroBanner from "../../components/dashboard/HeroBanner";
import StatCard from "../../components/dashboard/StatCard";
import SectionCard from "../../components/dashboard/SectionCard";
import ConfirmModal from "../../components/feedback/ConfirmModal";
import StateBadge from "../../components/badges/StateBadge";
import ReportModerationList from "../../components/dashboard/ReportModerationList";
import AdminFeedbackList from "../../components/dashboard/AdminFeedbackList";
import { IconPackage, IconChevron, IconLeaf, IconBox } from "../../components/Icons";

import useDashboardGestor from "./hooks/useDashboardGestor";
import { CATEGORY_NAMES, GESTOR_TABS } from "./data/dashboardData";

const DashboardGestor = () => {
  const {
    user,
    navigate,
    activeTab,
    setActiveTab,
    pendingItems,
    toValidateItems,
    reports,
    pendingReportsCount,
    loadingReports,
    actionLoadingId,
    loading,
    error,
    balingItemId,
    setBalingItemId,
    confirmMarkAsBaled,
    handleDismissReport,
    handleDeleteReportedItem,
    handleDeactivateReportedUser,
    getWhatsAppLink,
  } = useDashboardGestor();

  if (!user) return null;

  const currentItems = activeTab === "pending" ? pendingItems : toValidateItems;

  return (
    <Layout>
      <div className="pt-20 pb-10 px-5 min-h-screen bg-gray-50">
        <div className="max-w-[980px] mx-auto">
          {/* Hero */}
          <HeroBanner
            title="Panel de Gestión de Materiales"
            subtitle="Gestiona el procesamiento, recolección y validación de materiales reciclables."
            impactLabel="Materiales pendientes"
            impactScore={pendingItems.length}
          />

          {/* Tarjetas de Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <StatCard
              label="Pendientes"
              value={pendingItems.length}
              sub="Materiales por procesar"
              accentColor="border-[#f59e0b]"
              iconBg="bg-[#fef3c7]"
              iconColor="text-[#d97706]"
              icon={<IconPackage />}
            />
            <StatCard
              label="Fardos"
              value={toValidateItems.length}
              sub="Pendientes de validación"
              accentColor="border-[#a855f7]"
              iconBg="bg-[#f3e8ff]"
              iconColor="text-[#9333ea]"
              icon={<IconBox />}
            />
            <StatCard
              label="Total"
              value={pendingItems.length + toValidateItems.length}
              sub="Materiales gestionados"
              accentColor="border-[#10b981]"
              iconBg="bg-[#d1fae5]"
              iconColor="text-[#059669]"
              icon={<IconLeaf />}
            />
          </div>

          {/* Acceso Rápido a Gestión de Puntos Limpios */}
          <div className="bg-white border border-emerald-200/80 rounded-2xl p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl shrink-0">
                🗺️
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 m-0">Puntos Limpios y Centros de Acopio</h3>
                <p className="text-xs text-gray-500 m-0">Personaliza marcadores en el mapa interactivo con OpenFreeMap.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/recycling-points')}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              Administrar Puntos
            </button>
          </div>

          {error && <SectionCard className="text-red-500 font-medium mb-4">{error}</SectionCard>}

          {/* Filtros de Pestañas */}
          <SectionCard className="mb-4">
            <div className="flex flex-wrap gap-2.5">
              {GESTOR_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl font-semibold text-xs border transition-colors cursor-pointer inline-flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "border-emerald-600/30 text-emerald-600 bg-emerald-50"
                      : "border-gray-200 text-gray-500 hover:bg-gray-100 bg-transparent"
                  }`}
                >
                  {tab.name}
                  {tab.id === "reports" && pendingReportsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                      {pendingReportsCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Sección Principal de Listado */}
          {loading ? (
            <SectionCard>
              <p className="text-sm text-gray-500 m-0 text-center py-4">Cargando datos...</p>
            </SectionCard>
          ) : activeTab === "reports" ? (
            <SectionCard 
              title={`Moderación de Denuncias (${reports.length})`}
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
          ) : (
            <SectionCard
              title={
                activeTab === "pending"
                  ? `Ítems Pendientes de Procesamiento (${pendingItems.length})`
                  : `Fardos Pendientes de Validación (${toValidateItems.length})`
              }
              actionLabel={
                <>
                  Ver todos <IconChevron />
                </>
              }
              onAction={() =>
                navigate(`/search?processingState=${activeTab === "pending" ? "sin_procesar" : "fardado"}`)
              }
            >
              {currentItems.length === 0 ? (
                <div className="text-center py-9 px-4 text-gray-500">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    {activeTab === "pending" ? <IconPackage /> : <IconBox />}
                  </div>
                  <p className="text-xs text-gray-500 m-0">
                    {activeTab === "pending" ? "No hay materiales pendientes." : "No hay fardos pendientes."}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {currentItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50/70 transition-colors"
                    >
                      {/* Información principal e imagen */}
                      <div className="flex items-center gap-3.5 flex-1 min-w-[260px]">
                        <div className="w-13 h-13 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {item.images && item.images[0] ? (
                            <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                          ) : activeTab === "pending" ? (
                            <IconPackage />
                          ) : (
                            <IconBox />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="text-sm font-semibold text-gray-800 m-0">{item.title}</h3>
                            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                              {CATEGORY_NAMES[item.category] || item.category}
                            </span>
                            <StateBadge state={item.processingState} />
                          </div>

                          {activeTab === "pending" && (
                            <p className="text-xs text-gray-500 m-0 mb-0.5">
                              <strong className="font-semibold text-gray-700">Publicado por:</strong>{" "}
                              {item.ownerId?.name || "Usuario"}{" "}
                              {item.ownerId?.email ? `(${item.ownerId.email})` : ""}
                            </p>
                          )}

                          {item.address && (
                            <p className="text-[11px] text-emerald-600 font-medium m-0">
                              📍 {item.address}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex items-center gap-2">
                        {activeTab === "pending" && item.ownerId?.phone && getWhatsAppLink(item.ownerId.phone) && (
                          <a
                            href={getWhatsAppLink(item.ownerId.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded-xl bg-[#25D366] text-white font-semibold text-xs no-underline inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                          >
                            WhatsApp
                          </a>
                        )}

                        <button
                          type="button"
                          className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors cursor-pointer border-0"
                          onClick={() =>
                            activeTab === "pending"
                              ? setBalingItemId(item._id)
                              : navigate(`/validate?itemId=${item._id}`)
                          }
                        >
                          {activeTab === "pending" ? "Marcar Fardado" : "Validar Fardo"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          )}

          {/* Feedback y Sugerencias de Desarrollo de la Comunidad */}
          <SectionCard 
            title="Feedback y Sugerencias de Desarrollo" 
            icon={IconBox} 
            className="mt-4"
          >
            <AdminFeedbackList />
          </SectionCard>

          {/* Accesos directos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="cursor-pointer transition-transform hover:-translate-y-0.5" onClick={() => navigate("/agenda")}>
              <SectionCard title="Agenda de Recolección">
                <p className="text-xs text-gray-500 m-0">Crear y gestionar rutas optimizadas.</p>
              </SectionCard>
            </div>

            <div className="cursor-pointer transition-transform hover:-translate-y-0.5" onClick={() => navigate("/historial")}>
              <SectionCard title="Archivo Histórico">
                <p className="text-xs text-gray-500 m-0">Historial de validaciones y movimientos.</p>
              </SectionCard>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para fardado */}
      <ConfirmModal
        isOpen={Boolean(balingItemId)}
        title="Confirmar Fardado de Material"
        message="¿Deseas marcar este material como fardado para pasarlo a la etapa de validación?"
        confirmText="Marcar como Fardado"
        cancelText="Cancelar"
        type="success"
        onConfirm={confirmMarkAsBaled}
        onCancel={() => setBalingItemId(null)}
      />
    </Layout>
  );
};

export default DashboardGestor;