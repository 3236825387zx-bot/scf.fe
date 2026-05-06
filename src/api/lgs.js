import { apiRequest } from './http'

export const fetchLgsProvider = (params) => apiRequest('/lgs/providers', { params })
export const saveLgsProvider = (payload) => apiRequest('/lgs/providers', { method: 'POST', body: payload })
export const toggleLgsProviderStatus = (code) => apiRequest(`/lgs/providers/${code}/toggle-status`, { method: 'POST' })

export const fetchLgsDelivery = (params) => apiRequest('/lgs/delivery', { params })

export const fetchLgsCallback = (params) => apiRequest('/lgs/callback', { params })
export const submitLgsIntercept = (payload) => apiRequest('/lgs/intercepts', { method: 'POST', body: payload })
