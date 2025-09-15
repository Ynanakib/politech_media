<script>
import "regenerator-runtime/runtime"
import * as Script from '@/assets/Script.js'
export default {
  name: "Logout",
  beforeCreate() {
    fetch(process.env.VUE_APP_BASE_URL + "/api/v1/logout", {
      method : "POST",
      headers: {
        'Content-Type' : 'application/json',
        'Connection' : 'keep-alive'
      },
      body: JSON.stringify({
        token : Script.LocalStorage.get("token")
      })
    }).finally(()=>{
      Script.LocalStorage.clear();
      this.$router.push("/");
    })
  },
};
</script>