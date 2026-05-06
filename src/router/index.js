import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/upstream-orders'
  },
  {
    path: '/upstream-orders',
    name: 'upstream-orders',
    component: () => import('../views/UpstreamOrdersView.vue')
  },
  {
    path: '/oms-workspace',
    name: 'oms-workspace',
    component: () => import('../views/OmsWorkspaceView.vue')
  },
  {
    path: '/oms-detail',
    name: 'oms-detail',
    component: () => import('../views/OmsOrderDetailView.vue')
  },
  {
    path: '/oms-rules',
    name: 'oms-rules',
    component: () => import('../views/OmsRulesView.vue')
  },
  {
    path: '/oms-exception',
    name: 'oms-exception',
    component: () => import('../views/OmsExceptionCenterView.vue')
  },
  {
    path: '/oms-split-merge',
    name: 'oms-split-merge',
    component: () => import('../views/OmsSplitMergeView.vue')
  },
  {
    path: '/oms-dashboard',
    name: 'oms-dashboard',
    component: () => import('../views/OmsDashboardView.vue')
  },
  {
    path: '/isc-ledger',
    name: 'isc-ledger',
    component: () => import('../views/IscLedgerView.vue')
  },
  {
    path: '/isc-adjustment',
    name: 'isc-adjustment',
    component: () => import('../views/IscAdjustmentView.vue')
  },
  {
    path: '/isc-alerts',
    name: 'isc-alerts',
    component: () => import('../views/IscAlertsView.vue')
  },
  {
    path: '/lgs-provider',
    name: 'lgs-provider',
    component: () => import('../views/LgsProviderView.vue')
  },
  {
    path: '/lgs-delivery',
    name: 'lgs-delivery',
    component: () => import('../views/LgsDeliveryView.vue')
  },
  {
    path: '/lgs-callback',
    name: 'lgs-callback',
    component: () => import('../views/LgsCallbackView.vue')
  },
  {
    path: '/wms-taskhall',
    name: 'wms-taskhall',
    component: () => import('../views/WmsTaskHallView.vue')
  },
  {
    path: '/wms-picking',
    name: 'wms-picking',
    component: () => import('../views/WmsPickingView.vue')
  },
  {
    path: '/wms-packing',
    name: 'wms-packing',
    component: () => import('../views/WmsPackingView.vue')
  },
  {
    path: '/wms-shipment',
    name: 'wms-shipment',
    component: () => import('../views/WmsShipmentView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
