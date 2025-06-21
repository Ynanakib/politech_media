<template>

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
  }
}
</script>