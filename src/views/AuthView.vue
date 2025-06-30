<template>
  <main>
    <div class="block">
      <div class="logo">
        <img src="@/assets/img/pnipu_logo.png" />
      </div>
      <div class="auth" v-if="auth">
        <p class="text">Для продолжения авторизируйтесь на сайте</p>
        <div id="VkIdSdkOneTap"></div>
      </div>
      <div class="fill1" v-if="fill1">
        <label for="firstname">Фамилия</label>
        <input type="text" id="secondname" v-model="this.registraton.last_name">

        <label for="name">Имя</label>
        <input type="text" id="name" v-model="this.registraton.first_name">

        <label for="secondname">Отчество</label>
        <input type="text" id="secondname" v-model="this.registraton.middle_name">

        <label for="phone">Номер телефона</label>
        <input type="phone" id="phone" v-model="this.registraton.phone">

        <label for="email">Электронная почта</label>
        <input type="email" id="email" v-model="this.registraton.email">

        <button @click="this.swap">Продолжить →</button>
      </div>
      <div class="fill2" v-if="fill2">
        <label for="city">Город</label>
        <input type="text" id="city" v-model="this.registraton.city">

        <label for="school">Школа</label>
        <input type="text" id="school" v-model="this.registraton.school">
        <label for="grade">Класс обучения</label>        
        <select name="grade" id="grade" v-model="this.registraton.grade">
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
          <option value="11">11</option>
        </select>
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
        last_name : "",
        first_name : "",
        middle_name : "",
        phone : "",
        email : "",
        city : "",
        school : "",
        grade : "11"
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
      scope: 'email messages phone groups vkid.personal_info',
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
        this.goToTesting();
      }else{
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
          'Content-Type' : 'application/json',
          'Connection' : 'keep-alive'
        },
        body: JSON.stringify({
          vk_id: JSON.parse(Script.getCookie("vk_tokens")).vk_id,
          payload: this.registraton
        })
      })
      .then( data => data.json() )
      .then( data => Script.setCookie("token", data.token) )
      .then(() => this.$router.push("testing"))
      .catch(console.warn)
    },
  },
};
</script>

<style scoped>
main {
  display: grid;
}
.block {
  border-radius: 24px;
  background-color: #d9d9d9;
  padding: 40px 60px;
  max-width: 470px;
  width: 90%;
  margin: auto;
  text-align: left;
}
.auth p.text {
  margin: 30px 0;
  font-size: var(--font-large-size);
  text-align: center;
  padding: 0 60px;
}
.block button {
  display: block;
  margin-top: 18px;
  background-color: #3d3d3d;
  font-size: var(--font-middle-size);
  padding: 10px;
  border: none;
  border-radius: 8px;
  color: white;
  width: 100%;
}
label{
    display: block;
    margin-bottom: 5px;
    font-size: var(--font-big-size);
    margin-top: 18px;
}
input, select{
    display: block;
    width: calc(100% - 20px);
    font-size: var(--font-small-size);
    border: 2px solid #3D3D3D;
    border-radius: 8px;
    padding: 8px;
}
select{
  width: 100%;
}
@media (max-width: 768px) {
  .block{
    padding: 10px 5px;
    width: 100vw;
    height: 75vh;
    overflow: auto;
  }
}
</style>