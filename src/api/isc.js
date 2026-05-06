import { apiRequest } from './http'

export const fetchIscLedger = (params) => apiRequest('/isc/ledger', { params })
export const fetchIscAdjustment = (params) => apiRequest('/isc/adjustments', { params })
export const fetchIscAlerts = (params) => apiRequest('/isc/alerts', { params })
