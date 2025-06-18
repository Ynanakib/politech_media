<template>
  <p></p>
</template>

<script>
export default {
  name: "Logout",
  beforeCreate() {
    localStorage.clear();
    this.$router.push("/");
  },
};
</script>