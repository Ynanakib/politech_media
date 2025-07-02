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
  height: var(--full-height);
  overflow: hidden;
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
  --full-height: -webkit-fill-available;
}
#app.not-safari{
  --full-height: 100vh;
}
#app.is-safari main{
  height: -webkit-fill-available;
}
#app.not-safari main{
  width: 100vw;
  height: var(--full-height);
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
