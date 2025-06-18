<template>
  <p></p>
</template>

<script>
export default {
  name: "HomeView",
  beforeCreate() {
    if (localStorage.getItem("token")) {
      this.$router.push("testing");
    } else {
      this.$router.push("auth");
    }
  },
};
</script>