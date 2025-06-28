<template>
  <button onclick="this.delete">delete :)</button>
</template>

<script>
import "regenerator-runtime/runtime"
import * as Script from "@/assets/scripts.js"

export default {
  name: "DebugView",
  mounted(){
    console.log("reg", Script.getCookie("reg"));
    console.log("result", Script.getCookie("result"));
    console.log("user_data", Script.getCookie("user_data"));
    console.log("vk_tokens", Script.getCookie("vk_tokens"));
    console.log("token", Script.getCookie("token"));
  },
  methods:{
    delete(){
      fetch(process.env.VUE_APP_BASE_URL + '/api/v1/debug', {
        method: 'POST',
        headers: {
          'Content-Type' : 'application/json',
          'Connection' : 'keep-alive'
        }
      })
      .then(e => e.json()).then(console.log)
    }
  }
}
</script>