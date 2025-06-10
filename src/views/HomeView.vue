<template>
  <p></p>
</template>

<script>
export default {
  name: "HomeView",
  beforeCreate() {
    if (localStorage.getItem("token") === null) {
      this.$router.push("auth");
    } else {
      this.$router.push("testing");
    }
  },
};
</script>