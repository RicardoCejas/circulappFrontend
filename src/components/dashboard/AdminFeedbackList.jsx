import React, { useState, useEffect } from "react";
import feedbackService from "../../services/feedbackService";

const AdminFeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadFeedbacks();
  }, [filterType]);

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const data = await feedbackService.getFeedbacks(filterType ? { type: filterType } : {});
      setFeedbacks(data.feedbacks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await feedbackService.updateStatus(id, newStatus);
      setFeedbacks(prev => prev.map(f => f._id === id ? { ...f, status: newStatus } : f));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Filtros rápidos */}
      <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-gray-100 text-xs">
        <div className="flex gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setFilterType("")}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              filterType === "" ? "bg-[#0F6E56] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Todos ({feedbacks.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("general_feedback")}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              filterType === "general_feedback" ? "bg-[#0F6E56] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Comentarios generales
          </button>
          <button
            type="button"
            onClick={() => setFilterType("beta_feature")}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              filterType === "beta_feature" ? "bg-[#0F6E56] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Probando Avances
          </button>
        </div>

        <button
          type="button"
          onClick={loadFeedbacks}
          className="text-[#0F6E56] hover:underline font-semibold text-xs cursor-pointer inline-flex items-center gap-1"
        >
          <i className="ti ti-refresh" /> Refrescar
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-gray-400">
          Cargando comentarios...
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="py-8 text-center text-xs text-gray-500 bg-gray-50 rounded-xl p-4">
          No hay comentarios registrados bajo este filtro.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {feedbacks.map(f => (
            <div key={f._id} className="py-3.5 first:pt-0 last:pb-0 text-xs space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm">{f.title}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {f.category}
                    </span>
                    <span className="text-amber-500 font-bold">
                      {"★".repeat(f.rating || 5)}{"☆".repeat(5 - (f.rating || 5))}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Enviado por: <strong className="text-gray-700">{f.userName}</strong> ({f.userRole})
                    {f.userEmail ? ` • ${f.userEmail}` : ""}
                    {f.pageUrl ? ` • Vista: ${f.pageUrl}` : ""}
                    {f.featureTested ? ` • Función: ${f.featureTested}` : ""}
                  </div>
                </div>

                {/* Selector de estado */}
                <div className="flex-shrink-0 flex items-center gap-1.5">
                  <select
                    disabled={updatingId === f._id}
                    value={f.status}
                    onChange={(e) => handleStatusChange(f._id, e.target.value)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-xl border border-gray-200 bg-white text-gray-700 outline-none cursor-pointer focus:border-[#0F6E56]"
                  >
                    <option value="nuevo">Nuevo</option>
                    <option value="en_revision">En revisión</option>
                    <option value="resuelto">Resuelto</option>
                    <option value="descartado">Descartado</option>
                  </select>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed bg-gray-50 p-2.5 rounded-xl border border-gray-100 m-0">
                "{f.comment}"
              </p>

              {f.attachments && f.attachments.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase">Capturas:</span>
                  {f.attachments.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                      <img src={img} alt="Captura" className="w-10 h-10 rounded-lg object-cover border border-gray-200 hover:opacity-80 transition" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFeedbackList;
