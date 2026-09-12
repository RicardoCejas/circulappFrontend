// circulappFrontend-main/src/services/recyclingPointService.js
import API from './Api';

const recyclingPointService = {
  /**
   * Obtiene todos los puntos de reciclaje, opcionalmente filtrados
   * @param {Object} params - { status, category, search, lat, lng, maxDistance }
   */
  async getRecyclingPoints(params = {}) {
    const response = await API.get('/recycling-points', { params });
    return response.data;
  },

  /**
   * Obtiene un punto de reciclaje por ID
   * @param {string} id
   */
  async getRecyclingPointById(id) {
    const response = await API.get(`/recycling-points/${id}`);
    return response.data;
  },

  /**
   * Crea un nuevo punto de reciclaje (Gestor / Admin)
   * @param {Object} data
   */
  async createRecyclingPoint(data) {
    const response = await API.post('/recycling-points', data);
    return response.data;
  },

  /**
   * Actualiza un punto de reciclaje existente (Gestor / Admin)
   * @param {string} id
   * @param {Object} data
   */
  async updateRecyclingPoint(id, data) {
    const response = await API.put(`/recycling-points/${id}`, data);
    return response.data;
  },

  /**
   * Elimina un punto de reciclaje (Gestor / Admin)
   * @param {string} id
   */
  async deleteRecyclingPoint(id) {
    const response = await API.delete(`/recycling-points/${id}`);
    return response.data;
  }
};

export default recyclingPointService;
