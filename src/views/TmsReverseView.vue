<template>
  <section class="view-grid">
    <article class="panel wide full-width">
      <div class="panel-head"><div><p class="eyebrow">Reverse Records</p><h3>逆向拦截结果</h3></div></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>履约单</th><th>执行节点</th><th>结果</th><th>详情</th></tr></thead>
          <tbody>
            <tr v-for="item in data.rows" :key="`${item.orderId}-${item.channel}`"><td>{{ item.orderId }}</td><td>{{ item.channel }}</td><td>{{ item.result }}</td><td>{{ item.detail }}</td></tr>
          </tbody>
        </table>
      </div>
    </article>
    <article class="panel wide">
      <div class="panel-head"><div><p class="eyebrow">Action Form</p><h3>当前拦截申请</h3></div></div>
      <div class="info-card"><p>订单号：{{ data.actionForm.orderId }}</p><p>原因：{{ data.actionForm.reason }}</p><p>窗口：{{ data.actionForm.window }}</p></div>
    </article>
  </section>
</template>

<script>
import { fetchTmsReverse } from '../api/tms'

export default {
  name: 'TmsReverseView',
  data() {
    return { data: { rows: [], actionForm: {} } }
  },
  async created() {
    this.data = await fetchTmsReverse()
  }
}
</script>
