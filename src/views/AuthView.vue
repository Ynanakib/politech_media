<template>
  <main>
    <div class="block">
      <div class="logo">
        <img src="@/assets/pnipu_logo.png" />
      </div>
      <div class="auth" v-if="auth">
        <p class="text">Для продолжения авторизируйтесь на сайте</p>
        <div id="VkIdSdkOneTap"></div>
      </div>
      <div class="fill1" v-if="fill1">
        <label for="firstname">Фамилия</label>
        <input type="text" id="secondname" v-model="this.registraton.secondName">

        <label for="name">Имя</label>
        <input type="text" id="name" v-model="this.registraton.name">

        <label for="secondname">Отчество</label>
        <input type="text" id="secondname" v-model="this.registraton.surname">

        <label for="phone">Номер телефона</label>
        <input type="text" id="phone" v-model="this.registraton.phone">

        <label for="email">Электронная почта</label>
        <input type="text" id="email" v-model="this.registraton.email">

        <button @click="this.swap">Продолжить →</button>
      </div>
      <div class="fill2" v-if="fill2">
        <label for="city">Город</label>
        <input type="text" id="city" v-model="this.registraton.city">

        <label for="school">Школа</label>
        <input type="text" id="school" v-model="this.registraton.school">

        <label for="nine"><input type="radio" name="grade" id="nine" v-model="this.registraton.grade" value="9">9 класс</label>
        <label for="eleven"><input type="radio" name="grade" id="eleven" v-model="this.registraton.grade" value="11">11 класс</label>

        <button @click="this.goToTesting">Продолжить →</button>
      </div>
    </div>
  </main>
</template>

<script>
import * as VKID from "@vkid/sdk";
import "regenerator-runtime/runtime"
import * as Script from "@/assets/scripts.js"

export default {
  name: "AuthView",
  data() {
    return {
      registraton: {
        surname: '',
        name: '',
        secondName: '',
        phone: '',
        email: '',
        city: '',
        school: '',
        grade: ''
      },
      auth: true,
      fill1: false,
      fill2: false,
    };
  },
  mounted(){
      VKID.Config.init({
        app: process.env.VUE_APP_VKAPP_ID,
        redirectUrl: process.env.VUE_APP_BASE_URL+'/vk-callback',
        scope: 'email phone',
        mode: VKID.ConfigAuthMode.Redirect
      });
      const oneTap = new VKID.OneTap();
      oneTap.render({
        container: document.getElementById('VkIdSdkOneTap'),
        showAlternativeLogin: false
      });
      if(Script.getCookie('user_data')){
        this.registraton = JSON.parse(Script.getCookie('user_data'));
      }      
    if(Script.getCookie("reg") !== null){
      this.swap();
    }
  },
  methods: {
    swap() {
      if (this.fill1) {
        this.auth = false;
        this.fill1 = false;
        this.fill2 = true;
      } else if (this.fill2) {
        this.auth = true;
        this.fill1 = false;
        this.fill2 = false;
      } else {
        this.auth = false;
        this.fill1 = true;
        this.fill2 = false;
      }
    },
    goToTesting() {
      Script.setCookie("user_data", JSON.stringify(this.registraton));
      fetch(process.env.VUE_APP_BASE_URL+"/api/v1/register", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: Script.getCookie("token"),
          payload: this.registraton
        })
      })
      .then(() => this.$router.push("testing"))
      .catch(console.warn)
    },
  },
};
</script>

<style scoped>
main {
  display: grid;
  height: calc(100vh);
}
.block {
  border-radius: 24px;
  background-color: #d9d9d9;
  padding: 40px 60px;
  width: 470px;
  margin: auto;
  text-align: left;
}
.auth p.text {
  margin: 30px 0;
  font-size: 24px;
  text-align: center;
  padding: 0 60px;
}
.block button {
  display: block;
  margin-top: 18px;
  background-color: #3d3d3d;
  font-size: 18px;
  padding: 10px;
  border: none;
  border-radius: 8px;
  color: white;
  width: 100%;
}
label{
    display: block;
    margin-bottom: 5px;
    font-size: 20px;
    margin-top: 18px;
}
input[type=radio]{
  display: inline;
  width: 30px;
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