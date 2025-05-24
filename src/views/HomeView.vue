<template>
  <p></p>
</template>

<script>
export default {
  name: "HomeView",
  mounted() {
    // if (localStorage.getItem("key") != null) {
    //   this.$router.push("testing");
    // } else {
      this.$router.push("auth");
    // }
  },
};
</script>