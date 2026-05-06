<template>
  <section class="view-grid">
    <article class="panel wide full-width">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Adjustment Request</p>
          <h3>库存调整申请</h3>
        </div>
      </div>
      <div class="summary-grid">
        <div class="info-card"><strong>申请单号</strong><p>{{ requestSummary.requestNo || '-' }}</p></div>
        <div class="info-card"><strong>申请类型</strong><p>{{ requestSummary.requestType || '-' }}</p></div>
        <div class="info-card"><strong>申请仓库</strong><p>{{ requestSummary.warehouse || '-' }}</p></div>
        <div class="info-card"><strong>SKU</strong><p>{{ requestSummary.sku || '-' }}</p></div>
        <div class="info-card"><strong>调整数量</strong><p>{{ requestSummary.delta || '-' }}</p></div>
        <div class="info-card"><strong>审批状态</strong><p>{{ requestSummary.status || '-' }}</p></div>
      </div>
      <div class="info-card">
        <strong>申请原因</strong>
        <p>{{ requestSummary.reason || '-' }}</p>
        <p>申请人：{{ requestSummary.applicant || '-' }}</p>
      </div>
    </article>

    <article class="panel wide full-width">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Adjustment Ledger</p>
          <h3>库存流水</h3>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>时间</th>
              <th>单据号</th>
              <th>SKU</th>
              <th>仓库</th>
              <th>动作</th>
              <th>数量</th>
              <th>调整前 ATP</th>
              <th>调整后 ATP</th>
              <th>原因</th>
              <th>操作人</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in ledgerRows" :key="`${item.time}-${item.billNo}-${item.sku}`">
              <td>{{ item.time }}</td>
              <td>{{ item.billNo }}</td>
              <td>{{ item.sku }}</td>
              <td>{{ item.warehouse }}</td>
              <td>{{ item.action }}</td>
              <td>{{ item.qty }}</td>
              <td>{{ item.beforeQty }}</td>
              <td>{{ item.afterQty }}</td>
              <td>{{ item.reason }}</td>
              <td>{{ item.operator }}</td>
            </tr>
            <tr v-if="!ledgerRows.length">
              <td colspan="10" class="empty-cell">暂无真实调整流水</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>

<script>
import { fetchIscAdjustment } from '../api/isc'

export default {
  name: 'IscAdjustmentView',
  data() {
    return { data: { form: {}, ledgerRows: [] } }
  },
  computed: {
    requestSummary() {
      return this.data.form || {}
    },
    ledgerRows() {
      return Array.isArray(this.data.ledgerRows) ? this.data.ledgerRows : []
    }
  },
  async created() {
    this.data = await fetchIscAdjustment()
  }
}
</script>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.empty-cell {
  padding: 28px 12px;
  text-align: center;
  color: var(--muted);
}

@media (max-width: 1180px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
