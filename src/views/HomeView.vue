<script>
import "regenerator-runtime/runtime"
import * as Script from "@/assets/scripts.js"
export default {
  name: "HomeView",
  beforeCreate() {
    if (Script.getCookie("token")) {
      // this.$router.push(
              console.log("push to: ", "testing");
    } else {
      // this.$router.push(
              console.log("push to: ", "auth");
    }
  },
};
</script>