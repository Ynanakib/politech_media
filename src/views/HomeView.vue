<template>
  <p></p>
</template>

<script>
import "regenerator-runtime/runtime"
import * as Script from "@/assets/scripts.js"
export default {
  name: "HomeView",
  beforeCreate() {
    if (Script.getCookie("token")) {
      this.$router.push("testing");
    } else {
      this.$router.push("auth");
    }
  },
};
</script>