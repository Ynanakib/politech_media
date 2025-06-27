<script>
import "regenerator-runtime/runtime"
import * as Script from "@/assets/scripts.js"
export default {
  name: "Logout",
  beforeCreate() {
    fetch(process.env.VUE_APP_BASE_URL + "/api/v1/session", {
      method : "DELETE",
      data: JSON.stringify({
        token : Script.getCookie("token")
      })
    }).finally(()=>{
      Script.clearCookie();
      this.$router.push("/");
    })
  },
};
</script>