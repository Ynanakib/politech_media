<template>
  <button @click="this.delete()">delete :)</button>
</template>
<script>
import "regenerator-runtime/runtime"
import * as Script from "@/assets/scripts.js"

export default {
  name: "DebugView",
  mounted(){
    console.log("state", Script.LocalStorage.get("state"));
    console.log("user_data", Script.LocalStorage.get("user_data"));
    console.log("vk_tokens", Script.LocalStorage.get("vk_tokens"));
    console.log("user_info", Script.LocalStorage.get("user_info"));
    console.log("token", Script.LocalStorage.get("token"));
    console.log("selectedCharacter", Script.LocalStorage.get("selectedCharacter"));
    console.log("gameResult", Script.LocalStorage.get("gameResult"));
  },
  methods:{
    delete(){
      fetch(process.env.VUE_APP_BASE_URL + '/api/v1/debug', { method: 'POST' })
      .then(e => e.json())
      .then(console.log)
    }
  }
}
</script>