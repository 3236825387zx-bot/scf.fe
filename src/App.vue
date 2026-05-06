<template>
  <div class="app-shell">
    <LoginView
      v-if="showLogin"
      :error-message="loginError"
      :loading="loginLoading"
      :password="loginForm.password"
      :username="loginForm.username"
      @submit-login="handleLogin"
      @submit-register="handleRegister"
      @update:password="loginForm.password = $event"
      @update:username="loginForm.username = $event"
    />

    <div v-else class="workspace-shell">
      <AppSidebar :items="navigationItems" />

      <main class="workspace-main">
        <AppHeader
          :eyebrow="currentMeta.eyebrow"
          :search-query="searchQuery"
          :title="currentMeta.title"
          :user-name="selectedUser.name"
          @logout="handleLogout"
          @update-search="searchQuery = $event"
        />

        <router-view v-slot="{ Component }">
          <component
            :is="Component"
            :current-user-name="selectedUser.name"
            :search-query="searchQuery"
            :selected-order="selectedOrder"
            :selected-order-detail="selectedOrderDetail"
            class="view-host"
            @back-to-list="handleBackToList"
            @select-order="openOrder"
          />
        </router-view>
      </main>
    </div>
  </div>
</template>

<script>
import {
  fetchNavigation,
  loginByPassword,
  registerByPassword
} from './api/app'
import { fetchOrderDetail } from './api/oms'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
import LoginView from './components/LoginView.vue'

const metaMap = {
  'upstream-orders': {
    eyebrow: '订单接入',
    title: '订单接入'
  },
  'oms-workspace': {
    eyebrow: 'OMS 工作台',
    title: '履约工作台'
  },
  'oms-detail': {
    eyebrow: 'OMS 详情',
    title: '履约单详情'
  },
  'oms-rules': {
    eyebrow: 'OMS 规则',
    title: '路由规则配置'
  },
  'oms-exception': {
    eyebrow: 'OMS 异常',
    title: '异常拦截中心'
  },
  'oms-split-merge': {
    eyebrow: 'OMS 拆单合单',
    title: '拆单合单管理'
  },
  'oms-dashboard': {
    eyebrow: '运营看板',
    title: '运营看板'
  },
  'isc-ledger': {
    eyebrow: 'ISC 台账',
    title: '库存台账'
  },
  'isc-adjustment': {
    eyebrow: 'ISC 调整',
    title: '库存调整'
  },
  'isc-alerts': {
    eyebrow: 'ISC 告警',
    title: '安全库存告警'
  },
  'lgs-provider': {
    eyebrow: 'LGS 物流商',
    title: '物流商管理'
  },
  'lgs-delivery': {
    eyebrow: 'LGS 交付',
    title: '包裹交付'
  },
  'lgs-callback': {
    eyebrow: 'LGS 回传',
    title: '交付回传'
  },
  'wms-taskhall': {
    eyebrow: 'WMS 任务大厅',
    title: '任务大厅'
  },
  'wms-picking': {
    eyebrow: 'WMS 拣货',
    title: '标准拣货'
  },
  'wms-packing': {
    eyebrow: 'WMS 打包',
    title: '复核打包'
  },
  'wms-shipment': {
    eyebrow: 'WMS 出库',
    title: '出库交接'
  },
  dashboard: {
    eyebrow: '订单接入',
    title: '订单接入'
  }
}

export default {
  name: 'AppPage',
  components: {
    AppHeader,
    AppSidebar,
    LoginView
  },
  data() {
    return {
      loginError: '',
      loginForm: {
        username: '',
        password: ''
      },
      loginLoading: false,
      navigationItems: [],
      omsOrderRows: [],
      searchQuery: '',
      selectedOrderDetail: null,
      selectedOrderId: '',
      selectedUserId: '',
      showLogin: true,
      users: []
    }
  },
  computed: {
    currentMeta() {
      return metaMap[this.$route.name] || metaMap.dashboard
    },
    selectedOrder() {
      return this.omsOrderRows.find((item) => item.id === this.selectedOrderId) || null
    },
    selectedUser() {
      return this.users.find((user) => user.id === this.selectedUserId) || {
        id: '',
        name: '访客',
        role: ''
      }
    }
  },
  methods: {
    async loadNavigation() {
      this.navigationItems = await fetchNavigation()
    },
    async handleLogin() {
      this.loginError = ''

      if (!String(this.loginForm.username || '').trim()) {
        this.loginError = '请输入账号'
        return
      }

      if (!String(this.loginForm.password || '').trim()) {
        this.loginError = '请输入密码'
        return
      }

      this.loginLoading = true

      try {
        const user = await loginByPassword(this.loginForm)
        this.users = [user]
        this.selectedUserId = user.id
        await this.loadNavigation()
        this.showLogin = false
        this.loginForm = { username: '', password: '' }
        await this.$router.push('/upstream-orders')
      } catch (error) {
        this.loginError = error.message || '登录失败，请检查账号密码'
      } finally {
        this.loginLoading = false
      }
    },
    async handleRegister(form) {
      this.loginError = ''
      this.loginLoading = true

      try {
        const user = await registerByPassword(form)
        this.users = [user]
        this.selectedUserId = user.id
        await this.loadNavigation()
        this.showLogin = false
        this.loginForm = { username: '', password: '' }
        await this.$router.push('/upstream-orders')
      } catch (error) {
        this.loginError = error.message || '注册失败'
      } finally {
        this.loginLoading = false
      }
    },
    async handleLogout() {
      await this.$router.push('/upstream-orders')
      this.searchQuery = ''
      this.selectedOrderId = ''
      this.selectedOrderDetail = null
      this.selectedUserId = ''
      this.navigationItems = []
      this.showLogin = true
    },
    async handleBackToList() {
      await this.$router.push('/upstream-orders')
      this.selectedOrderId = ''
      this.selectedOrderDetail = null
    },
    async openOrder(orderId) {
      this.selectedOrderId = orderId
      this.selectedOrderDetail = await fetchOrderDetail(orderId)
      await this.$router.push('/oms-detail')
    }
  }
}
</script>

<style>
@import './styles.css';
</style>
