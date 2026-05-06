import { apiRequest } from './http'

export const fetchOmsExceptions = (params) => apiRequest('/oms/exceptions', { params })
export const fetchOmsExceptionDetail = (id) => apiRequest(`/oms/exceptions/${id}`)
export const releaseOmsExceptionInventory = (id) => apiRequest(`/oms/exceptions/${id}/release-inventory`, { method: 'POST' })
export const rewriteOmsExceptionStatus = (id) => apiRequest(`/oms/exceptions/${id}/rewrite-status`, { method: 'POST' })
export const generateOmsExceptionCompensationLog = (id) => apiRequest(`/oms/exceptions/${id}/compensation-log`, { method: 'POST' })

export const fetchOmsRules = (params) => apiRequest('/oms/rules', { params })
export const createOmsRule = (payload) => apiRequest('/oms/rules', { method: 'POST', body: payload })
export const updateOmsRule = (id, payload) => apiRequest(`/oms/rules/${id}`, { method: 'PUT', body: payload })
export const deleteOmsRule = (id) => apiRequest(`/oms/rules/${id}`, { method: 'DELETE' })

export const fetchOmsDashboard = (params) => apiRequest('/oms/dashboard', { params })
export const fetchOmsSplitMerge = (params) => apiRequest('/oms/split-merge', { params })
export const createOmsSplitMergeRequest = (payload) => apiRequest('/oms/split-merge', { method: 'POST', body: payload })
export const executeOmsSplitMergeRequest = (requestId) => apiRequest(`/oms/split-merge/${requestId}/execute`, { method: 'POST' })
export const cancelOmsSplitMergeRequest = (requestId) => apiRequest(`/oms/split-merge/${requestId}/cancel`, { method: 'POST' })
export const fetchOrderDetail = (id) => apiRequest(`/oms/orders/${id}`)
