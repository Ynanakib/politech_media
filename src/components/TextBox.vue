<template><label for="txtBox">{{ label }}</label>
    <input type="text" id="txtBox">
    <!-- bind через переменные, сохранение в массив объектов -->
</template>

<script>
export default {
  name: 'TextBox',
  props: {
    label: String,
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
label{
    display: block;
    margin-bottom: 5px;
    font-size: 20px;
    margin-top: 18px;
}
input{
    display: block;
    width: calc(100% - 20px);
    font-size: 16px;
    border: 2px solid #3D3D3D;
    border-radius: 8px;
    padding: 8px;
}
</style>
