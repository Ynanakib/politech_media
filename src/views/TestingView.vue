<template>
  <main>
    <div class="bottom">
      <p class="question"></p>
      <div class="controls">
        <button>1</button>
        <button>2</button>
        <button>3</button>
        <button>4</button>
      </div>
    </div>
  </main>
</template>

<script>

</script>

<style scoped>
main {
  display: flex;
  flex-direction: column-reverse;
  height: 100vh;
}
.bottom{
  display: inline;
  padding: 75px 150px;
}
.controls{
  display: grid;
  grid-template-columns: 1fr 1fr; 
}
button{
  display: block;
  margin: 25px;
  height: 50px;
}
</style>
