const { defineConfig } = require('@vue/cli-service')

const gatewayTarget = 'http://localhost:8090'

module.exports = defineConfig({
  transpileDependencies: true,
  parallel: false,
  devServer: {
    proxy: {
      '/api': {
        target: gatewayTarget,
        changeOrigin: true
      },
      '/api/scf': {
        target: gatewayTarget,
        changeOrigin: true
      }
    }
  }
})
