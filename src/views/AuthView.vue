<template>
  <main>
    <div class="block">
      <div class="logo">
        <img src="@/assets/pnipu_logo.png" />
      </div>
      <div class="auth" v-if="auth">
        <p class="text">Для продолжения авторизируйтесь на сайте</p>
        <VkAuth></VkAuth>
      </div>
      <div class="fill1" v-if="fill1">
        <TextBox label="Фамилия" />
        <TextBox label="Имя" />
        <TextBox label="Отчество" />
        <TextBox label="Номер телефона" />
        <TextBox label="Электронная почта" />
        <button @click="this.swap">Продолжить →</button>
      </div>
      <div class="fill2" v-if="fill2">
        <TextBox label="Город" />
        <TextBox label="Школа" />
        <TextBox label="Класс" />
        <button @click="this.goToTesting">Продолжить →</button>
      </div>
    </div>
  </main>
</template>

<script>
import TextBox from "@/components/TextBox.vue";
import VkAuth from "@/components/VkAuth.vue";

export default {
  name: "AuthView",
  components: {
    TextBox,
    VkAuth,
  },
  data() {
    return {
      auth: true,
      fill1: false,
      fill2: false,
    };
  },
  created(){
    let request = {}
    {
      if(window.location.search != ""){
        let res = window.location.search.split("&")
        res[0] = res[0].substring(1)
        for(let i = 0; i < res.length; i++){
          let pair = res[i].split("=")
          request[pair[0]] = pair[1]
        }
      }
    }
  },
  mounted() {
    localStorage.clear();
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
      localStorage.setItem("key", 1234124);
      this.$router.push("testing");
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
</style>