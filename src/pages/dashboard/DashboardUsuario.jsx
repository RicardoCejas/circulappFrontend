import Layout from "../../components/layout/Layout";
import ErrorToast from "../../components/feedback/ErrorToast";
import HeroBanner from "../../components/dashboard/HeroBanner";
import StatCard from "../../components/dashboard/StatCard";
import SectionCard from "../../components/dashboard/SectionCard";
import LoadingSpinner from "../../components/feedback/LoadingSpinner";
import { 
  IconBox, 
  IconCheck, 
  IconClock, 
  IconPin, 
  IconSearch, 
  IconChevron, 
  IconImagePlaceholder 
} from "../../components/Icons";

import useDashboardUsuario from "./hooks/useDashboardUsuario";
import UserItemsSection from "./components/UserItemsSection";
import { CATEGORY_NAMES } from "./data/dashboardData";

const DashboardUsuario = () => {
  const { 
    user, 
    navigate, 
    error, 
    isLoading, 
    clearError, 
    myItems, 
    nearbyItems, 
    stats 
  } = useDashboardUsuario();

  if (!user) return null;

  return (
    <Layout>
      <ErrorToast error={error} onClose={clearError} />

      <div className="pt-20 pb-10 px-5 min-h-screen bg-gray-50">
        <div className="max-w-[980px] mx-auto">
          {/* Hero Banner */}
          <HeroBanner
            title={`¡Hola, ${user.name}!`}
            subtitle="Bienvenido de vuelta a ComunaRed"
            impactLabel="Impacto ambiental"
            impactScore={`${stats.impactScore} pts`}
          />

          {/* Tarjetas de Estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <StatCard 
              label="Publicados" 
              value={stats.totalPublished} 
              sub="materiales totales" 
              accentColor="border-[#f59e0b]" 
              iconBg="bg-[#fef3c7]" 
              iconColor="text-[#d97706]" 
              icon={<IconBox />} 
            />
            <StatCard 
              label="Validados" 
              value={stats.totalValidated} 
              sub="aprobados" 
              accentColor="border-[#10b981]" 
              iconBg="bg-[#d1fae5]" 
              iconColor="text-[#059669]" 
              icon={<IconCheck />} 
            />
            <StatCard 
              label="En proceso" 
              value={stats.totalPublished - stats.totalValidated} 
              sub="pendientes" 
              accentColor="border-[#a855f7]" 
              iconBg="bg-[#f3e8ff]" 
              iconColor="text-[#9333ea]" 
              icon={<IconClock />} 
            />
          </div>

          {/* Grid Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Mis productos (Nota la redirección con query params dentro de UserItemsSection si aplica) */}
            <UserItemsSection 
              items={myItems} 
              onViewAll={() => navigate("/profile?tab=products")} 
            />

            {/* Cerca de ti */}
            <SectionCard 
              title="Cerca de ti" 
              icon={IconPin} 
              actionLabel={<>Ver más <IconChevron /></>} 
              onAction={() => navigate("/search")}
            >
              {isLoading ? (
                <LoadingSpinner message="Buscando materiales cercanos..." />
              ) : nearbyItems.length === 0 ? (
                <div className="text-center py-9 px-4 text-gray-500">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <IconSearch />
                  </div>
                  <p className="text-xs text-gray-500 m-0">No hay materiales disponibles cerca.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {nearbyItems.slice(0, 3).map((item) => (
                    <div 
                      key={item._id} 
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100/70 transition-colors cursor-pointer" 
                      onClick={() => navigate(`/items/${item._id}`)}
                    >
                      {item.images?.[0] ? (
                        <img 
                          src={item.images[0]} 
                          alt={item.title} 
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0" 
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-200 flex-shrink-0 flex items-center justify-center">
                          <IconImagePlaceholder />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate m-0">{item.title}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 m-0">
                          {CATEGORY_NAMES[item.category] || item.category}
                        </p>
                        <p className="text-[11px] text-gray-400 m-0">
                          Por: {item.ownerId?.name || "Usuario"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button 
                  className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-xs hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer bg-transparent" 
                  onClick={() => navigate("/search")}
                >
                  <IconSearch /> Explorar materiales
                </button>
              </div>
            </SectionCard>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardUsuario;