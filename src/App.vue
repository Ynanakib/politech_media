<template>
  <!-- <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/auth">Auth</router-link> |
    <router-link to="/about">About</router-link>
  </nav> -->
  <router-view/>
</template>

<style>
#app {
  font-family: 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #000;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  color: black;
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

body{
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
  font-family: 'Roboto', sans-serif;
  --font-small-size: 16px;
  --font-middle-size: 18px;
  --font-big-size: 20px;
  --font-large-size: 24px;
}
</style>
