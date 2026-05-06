<template>
  <section class="view-grid tracking-page">
    <article class="panel wide full-width">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Tracking View</p>
          <h3>灞ョ害閾捐矾杩借釜</h3>
        </div>
        <div class="tracking-meta">
          <span>{{ orderTitle }}</span>
          <button type="button" class="query-button" @click="$router.push('/oms-workspace')">杩斿洖灞ョ害绠＄悊</button>
        </div>
      </div>

      <div class="macro-steps">
        <div v-for="step in macroSteps" :key="step.key" :class="['macro-step', step.state]">
          <span class="macro-index">{{ step.icon }}</span>
          <strong>{{ step.label }}</strong>
        </div>
      </div>
    </article>

    <article class="panel wide full-width">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Timeline</p>
          <h3>浜嬩欢鏃堕棿绾?/h3>
        </div>
      </div>

      <div class="timeline-stream">
        <div v-for="item in activeTimeline" :key="item.id" class="track-event">
          <div :class="['track-node', item.tone]">{{ item.system }}</div>
          <div class="track-body">
            <div class="row-between">
              <strong>{{ item.time }} - {{ item.title }}</strong>
              <span class="panel-note">{{ item.systemLabel }}</span>
            </div>
            <p>{{ item.text }}</p>
            <div v-if="item.card" class="attach-card">
              <strong>{{ item.card.title }}</strong>
              <p>{{ item.card.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>

<script>
const baseTimeline = [
  {
    id: '1',
    system: 'LGS',
    systemLabel: 'LGS 节点',
    tone: 'success',
    time: '2026-03-21 15:30:00',
    title: '宸茬鏀?,
    text: '瀹㈡埛宸茬鏀讹紝灞ョ害瀹屾垚銆?
  },
  {
    id: '2',
    system: 'LGS',
    systemLabel: 'LGS 节点',
    tone: 'info',
    time: '2026-03-20 09:00:00',
    title: '鐗╂祦鎻芥敹',
    text: '鎵胯繍鍟嗗凡瀹屾垚鎻芥敹锛岃繍鍗曞彿 SF123456789銆?
  },
  {
    id: '3',
    system: 'WMS',
    systemLabel: 'WMS 鑺傜偣',
    tone: 'warn',
    time: '2026-03-19 18:05:00',
    title: '鍖呰９鍑哄簱',
    text: '鍖呰９瀹屾垚绉伴噸骞跺嚭搴撲氦鎺ャ€?,
    card: {
      title: '闄勫姞淇℃伅',
      text: '搴撳瓨宸插悓姝ユ墸鍑忋€?
    }
  },
  {
    id: '4',
    system: 'WMS',
    systemLabel: 'WMS 鑺傜偣',
    tone: 'warn',
    time: '2026-03-19 17:30:00',
    title: '澶嶆牳鎵撳寘',
    text: '浠撳唴瀹屾垚澶嶆牳涓庢墦鍖呫€?
  },
  {
    id: '5',
    system: 'WMS',
    systemLabel: 'WMS 鑺傜偣',
    tone: 'warn',
    time: '2026-03-19 16:00:00',
    title: '鎷ｈ揣瀹屾垚',
    text: '鎷ｈ揣浠诲姟宸插畬鎴愩€?
  },
  {
    id: '6',
    system: 'OMS',
    systemLabel: 'OMS 鑺傜偣',
    tone: 'danger',
    time: '2026-03-19 15:05:00',
    title: '涓嬪彂浠撳偍',
    text: '灞ョ害鎸囦护宸蹭笅鍙戣嚦姝︽眽浠撱€?
  },
  {
    id: '7',
    system: 'ISC',
    systemLabel: 'ISC 鑺傜偣',
    tone: 'purple',
    time: '2026-03-19 15:01:00',
    title: '搴撳瓨閿佸畾',
    text: '鍙敭搴撳瓨宸查攣瀹氥€?
  },
  {
    id: '8',
    system: 'OMS',
    systemLabel: 'OMS 鑺傜偣',
    tone: 'danger',
    time: '2026-03-19 15:00:05',
    title: '璺敱鍐崇瓥',
    text: '绯荤粺宸插畬鎴愬垎浠撲笌鎵胯繍鍟嗗尮閰嶃€?
  },
  {
    id: '9',
    system: 'OMS',
    systemLabel: 'OMS 鑺傜偣',
    tone: 'danger',
    time: '2026-03-19 15:00:00',
    title: '璁㈠崟鎺ュ叆',
    text: 'OMS 宸叉帴鏀朵笂娓歌鍗曞苟鐢熸垚灞ョ害鍗曘€?
  }
]

export default {
  name: 'OmsTrackingView',
  props: {
    selectedOrder: { type: Object, default: null }
  },
  data() {
    return {
      activeTimeline: baseTimeline
    }
  },
  computed: {
    orderTitle() {
      return this.selectedOrder ? `${this.selectedOrder.orderNo} / ${this.selectedOrder.receiverName}` : 'FUL-998877'
    },
    macroSteps() {
      const signed = this.activeTimeline.some((item) => item.title === '宸茬鏀?)
      const collected = this.activeTimeline.some((item) => item.title === '鐗╂祦鎻芥敹')
      const picked = this.activeTimeline.some((item) => item.system === 'WMS')
      const currentStage = signed ? '宸茬鏀? : (collected ? '鐗╂祦閰嶉€佷腑' : (picked ? '浠撳偍浣滀笟涓? : '璋冨害鍒嗕粨涓?))
      const steps = ['璁㈠崟宸叉帴鍏?, '璋冨害鍒嗕粨涓?, '浠撳偍浣滀笟涓?, '鐗╂祦閰嶉€佷腑', '宸茬鏀?]

      return steps.map((label, index) => {
        const currentIndex = steps.indexOf(currentStage)
        let state = 'idle'
        if (index < currentIndex) state = 'done'
        else if (index === currentIndex) state = signed ? 'done' : 'current'
        return {
          key: label,
          label,
          state,
          icon: state === 'done' ? '鉁? : index + 1
        }
      })
    }
  }
}
</script>

<style scoped>
.tracking-meta {
  display: grid;
  justify-items: end;
  gap: 8px;
}

.macro-steps {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.macro-step {
  display: grid;
  gap: 8px;
  padding: 14px;
  border-radius: 14px;
  background: #f5f7fb;
  border: 1px solid var(--line);
}

.macro-step.done {
  background: #eaf6ee;
}

.macro-step.current {
  background: #eef5fc;
}

.macro-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(32, 57, 79, 0.1);
}

.timeline-stream {
  display: grid;
  gap: 14px;
}

.track-event {
  display: grid;
  grid-template-columns: 68px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
}

.track-node {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 8px 10px;
  border-radius: 999px;
  color: #fff;
  font-weight: 600;
}

.track-node.success {
  background: #3f8251;
}

.track-node.info {
  background: #2e77c7;
}

.track-node.warn {
  background: #b8871b;
}

.track-node.danger {
  background: #ba4d4d;
}

.track-node.purple {
  background: #7560a8;
}

.track-body {
  display: grid;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--panel-strong);
}

.attach-card {
  padding: 12px 14px;
  border-radius: 12px;
  background: #f5f8fb;
}

@media (max-width: 1180px) {
  .macro-steps {
    grid-template-columns: 1fr;
  }
}
</style>

