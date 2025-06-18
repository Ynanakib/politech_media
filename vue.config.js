const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // отключаем ESLint при сохранении и сборке
  lintOnSave: false
})
