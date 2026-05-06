<template>
  <section class="login-screen">
    <div class="login-panel compact-login">
      <div class="login-card single-auth-card">
        <div class="login-branding">
          <p class="eyebrow">供应链控制台</p>
          <h1>供应链履约控制台</h1>
        </div>

        <div class="auth-switch">
          <button
            :class="['auth-switch-item', { active: mode === 'login' }]"
            type="button"
            @click="mode = 'login'"
          >
            登录
          </button>
          <button
            :class="['auth-switch-item', { active: mode === 'register' }]"
            type="button"
            @click="mode = 'register'"
          >
            注册
          </button>
        </div>

        <h2>{{ mode === 'login' ? '账号密码登录' : '注册新账号' }}</h2>

        <form
          v-if="mode === 'login'"
          class="login-fields"
          @submit.prevent="$emit('submit-login')"
        >
          <label>
            <span>账号</span>
            <input
              :value="username"
              autocomplete="username"
              placeholder="请输入账号"
              type="text"
              @input="$emit('update:username', $event.target.value)"
            >
          </label>
          <label>
            <span>密码</span>
            <input
              :value="password"
              autocomplete="current-password"
              placeholder="请输入密码"
              type="password"
              @input="$emit('update:password', $event.target.value)"
            >
          </label>

          <p v-if="errorMessage" class="login-error">{{ errorMessage }}</p>

          <button :disabled="loading" type="submit" class="enter-button">
            {{ loading ? '登录中...' : '进入系统' }}
          </button>
        </form>

        <form
          v-else
          class="login-fields"
          @submit.prevent="submitRegister"
        >
          <label>
            <span>姓名</span>
            <input
              v-model="registerForm.name"
              autocomplete="name"
              placeholder="请输入姓名"
              type="text"
            >
          </label>
          <label>
            <span>账号</span>
            <input
              v-model="registerForm.username"
              autocomplete="username"
              placeholder="请输入账号"
              type="text"
            >
          </label>
          <label>
            <span>密码</span>
            <input
              v-model="registerForm.password"
              autocomplete="new-password"
              placeholder="请输入密码"
              type="password"
            >
          </label>
          <label>
            <span>确认密码</span>
            <input
              v-model="registerForm.confirmPassword"
              autocomplete="new-password"
              placeholder="请再次输入密码"
              type="password"
            >
          </label>

          <p v-if="errorMessage" class="login-error">{{ errorMessage }}</p>

          <button :disabled="loading" type="submit" class="enter-button">
            {{ loading ? '注册中...' : '注册并进入系统' }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'LoginView',
  props: {
    username: { type: String, default: '' },
    password: { type: String, default: '' },
    errorMessage: { type: String, default: '' },
    loading: { type: Boolean, default: false }
  },
  emits: ['submit-login', 'submit-register', 'update:password', 'update:username'],
  data() {
    return {
      mode: 'login',
      registerForm: {
        name: '',
        username: '',
        password: '',
        confirmPassword: ''
      }
    }
  },
  methods: {
    submitRegister() {
      this.$emit('submit-register', { ...this.registerForm })
    }
  }
}
</script>
