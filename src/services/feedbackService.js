// circulappFrontend-main/src/services/feedbackService.js
import API from "./Api";

const feedbackService = {
  /**
   * Enviar feedback o reporte de testing
   * @param {FormData|object} data 
   */
  createFeedback: async (data) => {
    const isFormData = data instanceof FormData;
    const config = isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
    const res = await API.post("/feedback", data, config);
    return res.data;
  },

  /**
   * Obtener listado comunitario de reportes
   * @param {object} params - { type, category, status, limit }
   */
  getFeedbacks: async (params = {}) => {
    const res = await API.get("/feedback", { params });
    return res.data;
  },

  /**
   * Actualizar estado del reporte (admin / gestor / dev)
   */
  updateStatus: async (id, status) => {
    const res = await API.patch(`/feedback/${id}/status`, { status });
    return res.data;
  }
};

export default feedbackService;
