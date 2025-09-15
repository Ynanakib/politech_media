<template>
  <button @click="this.delete()">delete :)</button>
  <pre style="color: white; text-align: left;">{{ this.result }}</pre>
  <a href="./" style="color: white;">НАЗАД</a>
</template>
<script>
import "regenerator-runtime/runtime"
import * as Script from '@/assets/Script.js'

export default {
  name: "DebugView",
  data(){
    return {
      result: ""
    }
  },
  methods:{
    delete(){
      Script.LocalStorage.clear()
      fetch(process.env.VUE_APP_BASE_URL + '/api/v1/debug?vk_id=299484198')
      .then(e => e.text())
      .then(e => this.result = e)
    }
  }
}
</script>