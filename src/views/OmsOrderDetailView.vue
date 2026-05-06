<template>
  <section class="view-grid">
    <article class="panel wide full-width">
      <div class="panel-head">
        <div>
          <p class="eyebrow">OMS Detail</p>
          <h3>履约单详情</h3>
        </div>
        <button type="button" class="mini-action" @click="$emit('back-to-list')">返回列表</button>
      </div>

      <template v-if="detail">
        <div class="card-grid two">
          <article class="info-card">
            <strong>主单信息</strong>
            <p>履约单号：{{ detail.base.orderNo }}</p>
            <p>外部单号：{{ detail.base.externalNo }}</p>
            <p>主键 ID：{{ detail.base.id }}</p>
            <p>父单 ID：{{ detail.base.parentId || '-' }}</p>
            <p>履约状态：{{ detail.base.statusText }}</p>
            <p>订单金额：{{ detail.base.totalAmount }}</p>
          </article>

          <article class="info-card">
            <strong>履约信息</strong>
            <p>发货仓：{{ detail.base.warehouseName || '-' }} ({{ detail.base.warehouseId || '-' }})</p>
            <p>承运商：{{ detail.base.logisticsProviderName || '-' }} ({{ detail.base.logisticsProvider || '-' }})</p>
            <p>物流单号：{{ detail.base.trackingNumber || '-' }}</p>
            <p>拦截状态：{{ detail.base.interceptStatus || '-' }}</p>
          </article>

          <article class="info-card">
            <strong>收货信息</strong>
            <p>收货人：{{ detail.base.receiverName }}</p>
            <p>手机号：{{ maskPhone(detail.base.receiverPhone) }}</p>
            <p>地址：{{ fullAddress }}</p>
          </article>

          <article class="info-card">
            <strong>时间信息</strong>
            <p>创建时间：{{ detail.base.createTime }}</p>
            <p>下发时间：{{ detail.base.dispatchTime || '-' }}</p>
            <p>出库时间：{{ detail.base.outboundTime || '-' }}</p>
            <p>更新时间：{{ detail.base.updateTime }}</p>
            <p>版本号：{{ detail.base.version }}</p>
          </article>
        </div>

        <article class="panel wide full-width">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Order Details</p>
              <h3>商品明细</h3>
            </div>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>商品名称</th>
                  <th>数量</th>
                  <th>单价</th>
                  <th>分摊金额</th>
                  <th>重量(kg)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in detail.details" :key="item.id">
                  <td>{{ item.skuId }}</td>
                  <td>{{ item.skuName }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ item.price }}</td>
                  <td>{{ item.splitAmount }}</td>
                  <td>{{ item.weight }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article class="panel wide full-width">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Order Logs</p>
              <h3>生命周期日志</h3>
            </div>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>时间</th>
                  <th>动作</th>
                  <th>操作人</th>
                  <th>状态变更</th>
                  <th>备注</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in detail.logs" :key="item.id">
                  <td>{{ item.createTime }}</td>
                  <td>{{ item.action }}</td>
                  <td>{{ item.operator }}</td>
                  <td>{{ formatStatus(item) }}</td>
                  <td>{{ item.remark }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </template>
    </article>
  </section>
</template>

<script>
export default {
  name: 'OmsOrderDetailView',
  props: {
    selectedOrderDetail: { type: Object, default: null }
  },
  emits: ['back-to-list'],
  computed: {
    detail() {
      return this.selectedOrderDetail
    },
    fullAddress() {
      if (!this.detail) return ''
      return [
        this.detail.base.province,
        this.detail.base.city,
        this.detail.base.district,
        this.detail.base.detailAddress
      ].filter(Boolean).join('')
    }
  },
  methods: {
    formatStatus(item) {
      const oldStatus = item.oldStatusText ?? item.oldStatus ?? '初始'
      const newStatus = item.newStatusText ?? item.newStatus ?? '-'
      return `${oldStatus} -> ${newStatus}`
    },
    maskPhone(phone) {
      if (!phone || phone.length < 7) return phone || '-'
      return `${phone.slice(0, 3)}****${phone.slice(-4)}`
    }
  }
}
</script>
