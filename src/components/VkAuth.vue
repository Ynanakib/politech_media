<template>
  <div id="VkIdSdkOneTap"></div>
</template>
<script>
import * as VKID from "@vkid/sdk";

export default {
  name: "VkAuth",
  props: {},
  mounted() {
    VKID.Config.init({
      app: process.env.VUE_APP_VKAPP_ID,
      redirectUrl: process.env.VUE_APP_BASE_URL+'/vk-callback',
      scope: 'email phone'
    });
    const oneTap = new VKID.OneTap();
    oneTap.render({
      container: document.getElementById('VkIdSdkOneTap'),
      showAlternativeLogin: false
    });
  }
}
</script>

<style scoped></style>
