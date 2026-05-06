<template>
  <aside class="drawer-panel">
    <div class="drawer-head">
      <div>
        <p class="eyebrow">OMS Detail</p>
        <h3>{{ detail.base.orderNo }}</h3>
      </div>
      <button class="drawer-close" type="button" @click="$emit('close')">关闭</button>
    </div>

    <article class="drawer-card">
      <div class="row-between">
        <strong>{{ detail.base.receiverName }}</strong>
        <span class="chip warning">{{ detail.base.statusText }}</span>
      </div>
      <p>主键 ID：{{ detail.base.id }}</p>
      <p>外部单号：{{ detail.base.externalNo }}</p>
      <p>父单 ID：{{ detail.base.parentId || '-' }}</p>
      <p>发货仓库：{{ detail.base.warehouseName || '-' }}（{{ detail.base.warehouseId || '-' }}）</p>
      <p>物流承运商：{{ detail.base.logisticsProviderName || '-' }}（{{ detail.base.logisticsProvider || '-' }}）</p>
      <p>物流单号：{{ detail.base.trackingNumber || '-' }}</p>
      <p>订单金额：￥{{ detail.base.totalAmount }}</p>
      <p>版本号：{{ detail.base.version }}</p>
      <p>拦截状态：{{ detail.base.interceptStatus }}</p>
    </article>

    <article class="drawer-card">
      <strong>收件信息</strong>
      <p>{{ detail.base.receiverName }} / {{ maskPhone(detail.base.receiverPhone) }}</p>
      <p>{{ fullAddress }}</p>
    </article>

    <article class="drawer-card">
      <strong>时间节点</strong>
      <p>创建时间：{{ detail.base.createTime }}</p>
      <p>下发时间：{{ detail.base.dispatchTime || '-' }}</p>
      <p>出库时间：{{ detail.base.outboundTime || '-' }}</p>
      <p>更新时间：{{ detail.base.updateTime }}</p>
    </article>

    <article class="drawer-card">
      <strong>订单明细</strong>
      <div class="drawer-list compact-list">
        <div v-for="item in detail.details" :key="item.id" class="mini-row">
          <span>{{ item.skuId }}</span>
          <span>{{ item.skuName }}</span>
          <span>x{{ item.quantity }}</span>
          <span>￥{{ item.splitAmount }}</span>
        </div>
      </div>
    </article>

    <article class="drawer-card">
      <strong>生命周期日志</strong>
      <ol class="step-list">
        <li v-for="item in detail.logs" :key="item.id">
          {{ item.createTime }} / {{ item.action }} / {{ item.operator }} / {{ formatStatus(item.oldStatus) }} -> {{ formatStatus(item.newStatus) }} / {{ item.remark }}
        </li>
      </ol>
    </article>
  </aside>
</template>

<script>
const statusMap = {
  10: '待调度',
  20: '已分仓',
  30: '已锁库',
  40: '已下发',
  50: '已出库',
  90: '已取消'
}

export default {
  name: 'OrderDetailDrawer',
  props: {
    order: { type: Object, required: true },
    detail: { type: Object, required: true }
  },
  emits: ['close'],
  computed: {
    fullAddress() {
      return [
        this.detail.base.province,
        this.detail.base.city,
        this.detail.base.district,
        this.detail.base.detailAddress
      ].filter(Boolean).join('')
    }
  },
  methods: {
    formatStatus(status) {
      if (status === null || status === undefined) return '初始化'
      return statusMap[status] || String(status)
    },
    maskPhone(phone) {
      if (!phone || phone.length < 7) return phone || '-'
      return `${phone.slice(0, 3)}****${phone.slice(-4)}`
    }
  }
}
</script>
