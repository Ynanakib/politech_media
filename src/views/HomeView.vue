<script>
import "regenerator-runtime/runtime"
import * as Script from "@/assets/scripts.js"
export default {
  name: "HomeView",
  beforeCreate() {
    if (Script.LocalStorage.get("token")) {
      this.$router.push("testing")
    } else {
      if(Script.LocalStorage.get("state") == "auth"){
        this.$router.push("auth")
      }else if(Script.LocalStorage.get("state") == "reg"){
        this.$router.push("auth")
      }else{
        Script.LocalStorage.set("state", "vk")
        window.location.href = process.env.VUE_APP_VK_CLUB_LINK
      }
    }
  },
};
</script>