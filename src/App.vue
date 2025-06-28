<template>
  <!-- <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/auth">Auth</router-link> |
    <router-link to="/about">About</router-link>
  </nav> -->
  <router-view/>
</template>

<style>
*{
  margin: 0;
  padding: 0;
  color: black;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #000;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
#app.is-safari{
  height: -webkit-fill-available;
}
#app.is-safari main{
  height: -webkit-fill-available;
}
#app.not-safari{
  width: 100vw;
  height: 100vh;
}
#app.not-safari main{
  width: 100vw;
  height: 100vh;
}
</style>
