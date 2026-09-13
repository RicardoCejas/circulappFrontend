import React, { useState, useEffect } from "react";
import feedbackService from "../../services/feedbackService";

const ADVANCES_LIST = [
  {
    id: "map_osm_vector",
    title: "Mapa Interactivo con OpenStreetMap & MapLibre",
    status: "Activo / En prueba",
    description: "Búsqueda precisa por ciudad y dirección con zoom detallado a nivel de vivienda y fijación por arrastre de pin.",
    icon: "ti-map-2",
    badgeColor: "bg-emerald-100 text-emerald-800"
  },
  {
    id: "image_cloud_hybrid",
    title: "Almacenamiento de Fotos Híbrido y Cloudinary",
    status: "Activo / En prueba",
    description: "Subida optimizada de fotografías para publicaciones con soporte de respaldo local ante caídas de red.",
    icon: "ti-photo-up",
    badgeColor: "bg-blue-100 text-blue-800"
  },
  {
    id: "recycling_points_admin",
    title: "Gestión 100% Personalizable de Puntos Limpios",
    status: "Activo / En prueba",
    description: "Los gestores y administradores pueden crear centros de acopio con colores y categorías personalizadas.",
    icon: "ti-recycle",
    badgeColor: "bg-purple-100 text-purple-800"
  }
];

const BetaTestingDrawer = ({ isOpen, onClose, onOpenGeneralFeedback }) => {
  const [activeTab, setActiveTab] = useState("advances"); // "advances" | "reports" | "test_form"
  const [selectedFeature, setSelectedFeature] = useState(ADVANCES_LIST[0]);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Formulario rápido para testear la funcionalidad seleccionada
  const [testComment, setTestComment] = useState("");
  const [testRating, setTestRating] = useState(5);
  const [submittingTest, setSubmittingTest] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchReports();
    }
  }, [isOpen, activeTab]);

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const data = await feedbackService.getFeedbacks({ limit: 40 });
      setReports(data.feedbacks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleSendFeatureTest = async (e) => {
    e.preventDefault();
    if (!testComment.trim()) return;

    setSubmittingTest(true);
    try {
      await feedbackService.createFeedback({
        title: `Testing: ${selectedFeature.title}`,
        comment: testComment.trim(),
        type: "beta_feature",
        category: "rendimiento",
        featureTested: selectedFeature.title,
        rating: testRating,
        pageUrl: window.location.pathname
      });
      setTestSuccess(true);
      setTestComment("");
      setTimeout(() => {
        setTestSuccess(false);
        setActiveTab("reports");
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingTest(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      {/* Backdrop para cerrar */}
      <div className="flex-1 cursor-pointer" onClick={onClose} />

      {/* Drawer deslizante desde la derecha */}
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-gray-200 animate-in slide-in-from-right duration-250">
        
        {/* Cabecera del Panel */}
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-[#0F6E56] to-[#16A085] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg">
              <i className="ti ti-flask" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold m-0 leading-tight">Probando Avances</h2>
                <span className="text-[10px] font-bold bg-white/25 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  BETA LABS
                </span>
              </div>
              <p className="text-xs text-emerald-100 m-0 mt-0.5">
                Testeo y feedback de nuevas funciones
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            ✕
          </button>
        </div>

        {/* Pestañas de navegación interna */}
        <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("advances")}
            className={`flex-1 py-3 px-2 text-center transition border-b-2 ${
              activeTab === "advances"
                ? "border-[#0F6E56] text-[#0F6E56] bg-white"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Novedades ({ADVANCES_LIST.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reports")}
            className={`flex-1 py-3 px-2 text-center transition border-b-2 ${
              activeTab === "reports"
                ? "border-[#0F6E56] text-[#0F6E56] bg-white"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Reportes ({reports.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("test_form")}
            className={`flex-1 py-3 px-2 text-center transition border-b-2 ${
              activeTab === "test_form"
                ? "border-[#0F6E56] text-[#0F6E56] bg-white"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            + Testear
          </button>
        </div>

        {/* Contenido según pestaña */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* TAB 1: Avances disponibles */}
          {activeTab === "advances" && (
            <div className="space-y-3">
              <div className="p-3 bg-[#E1F5EE] rounded-2xl border border-[#A3E0CB] text-xs text-[#0F6E56] flex items-center gap-2.5">
                <i className="ti ti-info-circle text-base flex-shrink-0" />
                <span>
                  Explora las mejoras implementadas y ayúdanos a comprobar su funcionamiento en la plataforma.
                </span>
              </div>

              {ADVANCES_LIST.map(adv => (
                <div
                  key={adv.id}
                  className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-[#0F6E56] transition shadow-2xs group"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-[#E1F5EE] group-hover:text-[#0F6E56] flex items-center justify-center text-gray-600 transition">
                        <i className={`ti ${adv.icon}`} />
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 m-0">{adv.title}</h4>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${adv.badgeColor}`}>
                      {adv.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                    {adv.description}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFeature(adv);
                      setActiveTab("test_form");
                    }}
                    className="w-full py-1.5 px-3 rounded-xl bg-gray-50 hover:bg-[#E1F5EE] hover:text-[#0F6E56] text-gray-700 text-xs font-semibold border border-gray-200 hover:border-[#A3E0CB] transition flex items-center justify-center gap-1.5"
                  >
                    <i className="ti ti-check" />
                    Dejar feedback de esta función
                  </button>
                </div>
              ))}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenGeneralFeedback) onOpenGeneralFeedback();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-dashed border-gray-300 text-xs font-semibold text-gray-600 hover:text-[#0F6E56] hover:border-[#0F6E56] bg-gray-50 transition text-center block"
                >
                  ¿Quieres sugerir otra idea o mejora general? Clic aquí
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Reportes de la comunidad (Evitar duplicados) */}
          {activeTab === "reports" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Reportes Registrados
                </span>
                <button
                  type="button"
                  onClick={fetchReports}
                  className="text-xs text-[#0F6E56] hover:underline font-semibold"
                >
                  Actualizar
                </button>
              </div>

              {loadingReports ? (
                <div className="py-10 text-center text-xs text-gray-400">
                  Cargando reportes comunitarios...
                </div>
              ) : reports.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500 bg-gray-50 rounded-2xl border border-gray-100 p-4">
                  No hay reportes registrados aún. ¡Sé el primero en enviar comentarios!
                </div>
              ) : (
                reports.map(rep => (
                  <div key={rep._id} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-gray-900 truncate">
                        {rep.title}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        rep.status === "resuelto" ? "bg-emerald-100 text-emerald-800" :
                        rep.status === "en_revision" ? "bg-amber-100 text-amber-800" :
                        "bg-gray-200 text-gray-700"
                      }`}>
                        {rep.status}
                      </span>
                    </div>
                    <p className="text-gray-600 m-0 leading-relaxed break-words">
                      {rep.comment}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-200/60">
                      <span>Por: {rep.userName} ({rep.userRole})</span>
                      <span>★ {rep.rating || 5}/5</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Formulario de testing */}
          {activeTab === "test_form" && (
            <div>
              {testSuccess ? (
                <div className="py-8 text-center bg-[#E1F5EE] rounded-2xl border border-[#A3E0CB] p-4">
                  <span className="text-2xl block mb-2">🎉</span>
                  <h4 className="text-xs font-bold text-[#0F6E56]">¡Reporte de testing enviado!</h4>
                  <p className="text-[11px] text-[#0F6E56]/80 mt-1">
                    Se ha sumado a la lista comunitaria para evitar duplicados.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendFeatureTest} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">
                      Función a testear
                    </label>
                    <div className="p-2.5 rounded-xl bg-gray-100 border border-gray-200 text-xs font-bold text-gray-800">
                      {selectedFeature.title}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">
                      Calificación (1-5)
                    </label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setTestRating(st)}
                          className={`flex-1 py-1 text-sm rounded-lg font-bold transition ${
                            testRating === st ? "bg-[#0F6E56] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {st} ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">
                      Comentarios o fallas encontradas *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Describe si la función respondió bien, si hubo algún bug visual o demora..."
                      value={testComment}
                      onChange={(e) => setTestComment(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:border-[#0F6E56] outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingTest}
                    className="w-full py-2 px-4 rounded-xl bg-[#0F6E56] hover:bg-[#0c5946] text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {submittingTest ? "Registrando reporte..." : "Guardar Reporte en el Proyecto"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BetaTestingDrawer;
