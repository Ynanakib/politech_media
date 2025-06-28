<script>
import "regenerator-runtime/runtime"
import * as Script from "@/assets/scripts.js"
export default {
  name: "Logout",
  beforeCreate() {
    fetch(process.env.VUE_APP_BASE_URL + "/api/v1/logout", {
      method : "POST",
      headers: {
        'Content-Type' : 'application/json',
        'Connection' : 'keep-alive'
      },
      data: JSON.stringify({
        token : Script.getCookie("token")
      })
    }).finally(()=>{
      Script.clearCookie();
      // this.$router.push(
              console.log("push to: ", "/");
    })
  },
};
</script>