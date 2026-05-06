import { apiRequest } from './http'

export const fetchWmsTaskHall = (params) => apiRequest('/wms/taskhall', { params })
export const fetchWmsWaveDetail = (waveId) => apiRequest(`/wms/taskhall/${waveId}`)
export const createWmsWave = (payload) => apiRequest('/wms/taskhall', { method: 'POST', body: payload })
export const updateWmsWave = (waveId, payload) => apiRequest(`/wms/taskhall/${waveId}`, { method: 'PUT', body: payload })
export const deleteWmsWave = (waveId) => apiRequest(`/wms/taskhall/${waveId}`, { method: 'DELETE' })

export const fetchWmsPicking = (params) => apiRequest('/wms/picking', { params })
export const fetchWmsPickingDetail = (id) => apiRequest(`/wms/picking/${id}`)
export const updateWmsPickingTask = (id, payload) => apiRequest(`/wms/picking/${id}`, { method: 'PUT', body: payload })

export const fetchWmsPacking = (params) => apiRequest('/wms/packing', { params })
export const fetchWmsPackingDetail = (id) => apiRequest(`/wms/packing/${id}`)
export const updateWmsPackingOrder = (id, payload) => apiRequest(`/wms/packing/${id}`, { method: 'PUT', body: payload })

export const fetchWmsShipment = (params) => apiRequest('/wms/shipment', { params })
export const fetchWmsShipmentDetail = (id) => apiRequest(`/wms/shipment/${id}`)
export const updateWmsShipmentRecord = (id, payload) => apiRequest(`/wms/shipment/${id}`, { method: 'PUT', body: payload })
