<template>
    <main>
        <div class="block">
          <div class="logo">
            <img src="@/assets/pnipu_logo.png">
          </div>
          <div class="auth" v-if="auth">
            <p class="text">Для продолжения авторизируйтесь на сайте</p>
            <VkAuth></VkAuth>
          </div>
          <div class="fill1" v-if="fill1">
            <TextBox label="Фамилия"/>
            <TextBox label="Имя"/>
            <TextBox label="Отчество"/>
            <TextBox label="Номер телефона"/>
            <TextBox label="Электронная почта"/>
            <button @click="this.swap">Продолжить →</button>
          </div>
          <div class="fill2" v-if="fill2">
            <TextBox label="a"/>
            <TextBox label="a"/>
            <TextBox label="a"/>
            <TextBox label="a a"/>
            <TextBox label="a a"/>
            <button @click="this.swap">Продолжить →</button>
          </div>
        </div>
    </main> 
</template>

<script>
import TextBox from '@/components/TextBox.vue';
import VkAuth from '@/components/VkAuth.vue';


export default {
  name: 'AuthView',
  components: {
    TextBox,
    VkAuth, 
  },
  data(){
    return {
      auth: true,
      fill1: false,
      fill2: false,
    }
  },
  methods: {
    swap(){
      if(this.fill1){
        this.auth = false
        this.fill1 = false
        this.fill2 = true
      }else if(this.fill2){
        this.auth = true
        this.fill1 = false
        this.fill2 = false
      }else {
        this.auth = false
        this.fill1 = true
        this.fill2 = false
      }
    }
  }
}
</script>

<style scoped>
main{
  display: grid;
  height: calc(100vh);
}
.block{
  border-radius: 32px;
  background-color: #D9D9D9;
  padding: 50px 70px;
  width: 630px;
  margin: auto;
  text-align: left;
}
.auth p.text{
  margin: 40px 0;
  font-size: 32px;
  text-align: center;
  padding: 0 80px;

}
.block button{
    display: block;
    margin-top: 18px;
    background-color: #3D3D3D;
    font-size: 20px;
    padding: 10px;
    border: none;
    border-radius: 8px;
    color: white;
    width: 100%;
}
</style>