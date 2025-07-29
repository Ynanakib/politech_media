<template>
  <button @click="this.delete()">delete :)</button>
  <pre style="color: white; text-align: left;">{{ output() }}</pre>
  <pre style="color: white; text-align: left;">{{ this.result }}</pre>
  <a href="./" style="color: white;">НАЗАД</a>
</template>
<script>
import "regenerator-runtime/runtime"
import * as Script from "@/assets/scripts.js"

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
      
      fetch(process.env.VUE_APP_BASE_URL + '/api/v1/debug?vk_id=604022898')
      .then(e => e.text())
      .then(e => this.result += e + "\n")
    },
    output(){
      return "state " + Script.LocalStorage.get("state") + "\n"
        + "user_data " + Script.LocalStorage.get("user_data") + "\n"
        + "vk_tokens " + Script.LocalStorage.get("vk_tokens") + "\n"
        + "user_info " + Script.LocalStorage.get("user_info") + "\n"
        + "token " + Script.LocalStorage.get("token") + "\n"
        + "selectedCharacter " + Script.LocalStorage.get("selectedCharacter") + "\n"
        + "gameResult " + Script.LocalStorage.get("gameResult") + "\n"
    }
  }
}
</script>