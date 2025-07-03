<template>
  <main>
    <div v-if="currentStep === 'intro'" class="intro-full">
      <div class="intro-content">
        <h1>Добро пожаловать!</h1>
        <p>Пройдите короткую регистрацию, чтобы начать.</p>
        <button class="btn btn-start" @click="currentStep = 'user_agreement'">Старт</button>
      </div>
    </div>
    <div v-if="currentStep === 'user_agreement'" class="agreement-full">
      <div class="agreement-scroll agreement-full-scroll" ref="agreementScroll" @scroll="onAgreementScroll">
        <div class="agreement-content" v-html="agreementHtml"></div>
      </div>
      <div class="agreement-check agreement-full-check">
        <input type="checkbox" id="agreementCheck" v-model="agreementChecked" :disabled="!agreementScrolled" />
        <label class="white" for="agreementCheck">Я ознакомлен и принимаю пользовательское соглашение</label>
      </div>
      <button class="btn btn-agreement" :disabled="!agreementChecked" @click="goToDialogAccess">Продолжить</button>
    </div>
    <div class="block" v-if="['auth','dialog_access','fill1','fill2'].includes(currentStep)">
      <div class="logo">
        <img src="@/assets/img/pnipu_logo.png" />
      </div>
      <div class="auth" v-if="currentStep === 'auth'">
        <p class="text">Войдите через VK ID</p>
        <div id="VkIdSdkOneTap"></div>
        <button @click="debug">DEBUG</button>
      </div>
      <div class="confirmation" v-if="currentStep === 'dialog_access'">
        <p class="text">Подтвердите отправку сообщений Вам</p>
        <p>После подтверждения вам придут результаты теста и общая информация о поступлении!</p>
        <a class="btn tinted" href="https://vk.com/im?sel=-230312236">Разрешить!</a>
        <button class="btn" @click="showRegistrationForm">Продолжить</button>
      </div>
      <div class="fill1" v-if="currentStep === 'fill1'">
        <div v-if="formError" class="form-error">{{ formError }}</div>
        <label for="lastname">Фамилия</label>
        <input type="text" id="lastname" v-model="registraton.last_name" required @blur="validateName('last_name')" :class="{'invalid': nameError.last_name}">
        <span v-if="nameError.last_name" class="error">Фамилия должна начинаться с заглавной буквы и содержать только буквы</span>
        <label for="name">Имя</label>
        <input type="text" id="name" v-model="registraton.first_name" required @blur="validateName('first_name')" :class="{'invalid': nameError.first_name}">
        <span v-if="nameError.first_name" class="error">Имя должно начинаться с заглавной буквы и содержать только буквы</span>
        <label for="secondname">Отчество</label>
        <input type="text" id="secondname" v-model="registraton.middle_name" required @blur="validateName('middle_name')" :class="{'invalid': nameError.middle_name}">
        <span v-if="nameError.middle_name" class="error">Отчество должно начинаться с заглавной буквы и содержать только буквы</span>
        <label for="phone">Номер телефона</label>
        <input type="text" id="phone" v-model="phoneInput" @input="onPhoneInput" @keydown="onPhoneKeydown" maxlength="18" placeholder="+7 (___) ___-__-__" required>
        <label for="email">Электронная почта</label>
        <input type="email" id="email" v-model="registraton.email" @blur="validateEmail" :class="{'invalid': emailError}">
        <span v-if="emailError" class="error">Некорректный email</span>
        <button @click="validateFill1">Продолжить →</button>
      </div>
      <div class="fill2" v-if="currentStep === 'fill2'">
        <div v-if="formError" class="form-error">{{ formError }}</div>
        <!-- <label for="city">Регион</label>
        <input type="text" id="city" v-model="regionInput" @input="onRegionInput" @focus="showRegionDropdown = true" @blur="hideDropdown('region')" autocomplete="off" required>
        <ul v-if="showRegionropdown && filteredRegions.length" class="dropdown">
          <li v-for="region in filteredRegionos" :key="region" @mousedown.prevent="selectRegion(region)">{{ region }}</li>
        </ul> -->
        <label for="city">Город</label>
        <input type="text" id="city" v-model="cityInput" @input="onCityInput" @focus="showCityDropdown = true" @blur="hideDropdown('city')" autocomplete="off" required>
        <ul v-if="showCityDropdown && filteredCities.length" class="dropdown">
          <li v-for="city in filteredCities" :key="city" @mousedown.prevent="selectCity(city)">{{ city }}</li>
        </ul>
        <label for="school">Школа</label>
        <input type="text" id="school" v-model="schoolInput" @input="onSchoolInput" @focus="showSchoolDropdown = true" @blur="hideDropdown('school')" autocomplete="off" required>
        <ul v-if="showSchoolDropdown && filteredSchools.length" class="dropdown">
          <li v-for="school in filteredSchools" :key="school" @mousedown.prevent="selectSchool(school)">{{ school }}</li>
        </ul>
        <label for="grade">Класс обучения</label>
        <select name="grade" id="grade" v-model="registraton.grade">
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
          <option value="11">11</option>
        </select>
        <button @click="goToTesting">Продолжить →</button>
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
      currentStep: 'intro',
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
      phoneInput: '',
      emailError: false,
      cityInput: '',
      schoolInput: '',
      showCityDropdown: false,
      showSchoolDropdown: false,
      cities: ["Пермь", "Москва", "Екатеринбург", "Казань", "Сочи"],
      schools: ["Школа №1", "Гимназия №2", "Лицей №3", "Школа №4", "Школа №5"],
      agreementChecked: false,
      agreementScrolled: false,
      agreementHtml: '',
      formError: '',
      nameError: {
        last_name: false,
        first_name: false,
        middle_name: false
      },
    };
  },
  computed: {
    filteredCities() {
      const q = this.cityInput.toLowerCase();
      return this.cities.filter(city => city.toLowerCase().includes(q));
    },
    filteredSchools() {
      const q = this.schoolInput.toLowerCase();
      return this.schools.filter(school => school.toLowerCase().includes(q));
    }
  },
  mounted(){
    VKID.Config.init({
      app: process.env.VUE_APP_VKAPP_ID,
      redirectUrl: process.env.VUE_APP_BASE_URL+'/vk-callback',
      scope: 'email messages phone groups',
      mode: VKID.ConfigAuthMode.Redirect
    });

    if (Script.getCookie("reg") !== null) {
      this.currentStep = 'dialog_access';
    }
    if(Script.getCookie('user_data')){
      this.registraton = JSON.parse(Script.getCookie('user_data'));
      this.phoneInput = this.formatPhone(this.registraton.phone);
      this.cityInput = this.registraton.city;
      this.schoolInput = this.registraton.school;
    }
    if(Script.getCookie("reg") !== null){
      this.currentStep = 'dialog_access';
    }else{
      this.currentStep = 'user_agreement';
      this.$nextTick(() => { this.renderVkButton() });
    }
    fetch('/media/useragreement.htm')
      .then(res => res.text())
      .then(html => { this.agreementHtml = '<p style="margin-bottom: 0;">(Прокрутите до конца, чтобы активировать чекбокс)</p><div style="height: 200px;"></div>' + html; });
  },
  methods: {
    debug(){
      Script.setCookie("reg", 1)
      this.currentStep = 'dialog_access'
    },
    switchPdf(){
      this.currentStep = this.currentStep === 'user_agreement_pdf' ? 'user_agreement' : 'user_agreement_pdf';
    },
    renderVkButton(){
      const container = document.getElementById('VkIdSdkOneTap');
      if (container) {
        const oneTap = new VKID.OneTap();
        oneTap.render({
          container: container,
          showAlternativeLogin: false
        });
      }
    },
    goToAuth() {
      this.currentStep = 'auth';
      this.$nextTick(() => { this.renderVkButton() });
    },
    showRegistrationForm() {
      this.currentStep = 'fill1';
    },
    validateFill1() {
      this.formError = '';
      this.validateName('last_name');
      this.validateName('first_name');
      this.validateName('middle_name');
      if (this.nameError.last_name || this.nameError.first_name || this.nameError.middle_name) {
        this.formError = 'Проверьте правильность написания ФИО (с заглавной буквы, только буквы)';
        return;
      }
      if (!this.registraton.last_name || !this.registraton.first_name || !this.phoneInput || !this.registraton.middle_name) {
        this.formError = 'Заполните все обязательные поля!';
        return;
      }
      if (this.emailError) {
        this.formError = 'Проверьте корректность email!';
        return;
      }
      this.registraton.phone = this.unmaskPhone(this.phoneInput);
      this.currentStep = 'fill2';
    },
    validateEmail() {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.emailError = !re.test(this.registraton.email);
    },
    validateName(field) {
      const value = this.registraton[field];
      const re = /^[A-ZА-ЯЁ][a-zа-яё]+$/u;
      this.nameError[field] = !re.test(value);
    },
    onPhoneInput(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.startsWith('8')) value = '7' + value.slice(1);
      if (!value.startsWith('7')) value = '7' + value;
      if (e.inputType === 'deleteContentBackward' || e.inputType === 'deleteContentForward') {
        this.phoneInput = this.formatPhone(value);
        return;
      }
      let formatted = '+7 (';
      if (value.length > 1) formatted += value.slice(1, 4);
      if (value.length >= 4) formatted += ') ' + value.slice(4, 7);
      if (value.length >= 7) formatted += '-' + value.slice(7, 9);
      if (value.length >= 9) formatted += '-' + value.slice(9, 11);
      this.phoneInput = formatted;
    },
    onPhoneKeydown(e) {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        let value = this.phoneInput.replace(/\D/g, '');
        value = value.slice(0, -1);
        this.phoneInput = this.formatPhone(value);
        e.preventDefault();
      }
    },
    formatPhone(raw) {
      let value = raw.replace(/\D/g, '');
      if (!value) return '';
      if (value.startsWith('8')) value = '7' + value.slice(1);
      if (!value.startsWith('7')) value = '7' + value;
      let formatted = '+7 (';
      if (value.length > 1) formatted += value.slice(1, 4);
      if (value.length >= 4) formatted += ') ' + value.slice(4, 7);
      if (value.length >= 7) formatted += '-' + value.slice(7, 9);
      if (value.length >= 9) formatted += '-' + value.slice(9, 11);
      return formatted;
    },
    unmaskPhone(masked) {
      return masked.replace(/\D/g, '');
    },
    onCityInput() {
      this.showCityDropdown = true;
    },
    selectCity(city) {
      this.cityInput = city;
      this.registraton.city = city;
      this.showCityDropdown = false;
    },
    onSchoolInput() {
      this.showSchoolDropdown = true;
    },
    selectSchool(school) {
      this.schoolInput = school;
      this.registraton.school = school;
      this.showSchoolDropdown = false;
    },
    hideDropdown(type) {
      setTimeout(() => {
        if (type === 'city') this.showCityDropdown = false;
        if (type === 'school') this.showSchoolDropdown = false;
      }, 200);
    },
    goToTesting() {
      console.log(this.registraton)
      this.formError = '';
      if (!this.cityInput || !this.schoolInput || !this.registraton.grade) {
        this.formError = 'Заполните все обязательные поля!';
        return;
      }
      this.registraton.city = this.cityInput;
      this.registraton.school = this.schoolInput;
      const vkTokens = Script.getCookie("vk_tokens");
      if (!vkTokens) {
        this.formError = 'Ошибка: не найден VK ID';
        return;
      }
      const vk_id = Number(JSON.parse(vkTokens).vk_id);
      const payload = { ...this.registraton, grade: Number(this.registraton.grade) };
      Script.setCookie("user_data", JSON.stringify(payload));
      fetch(process.env.VUE_APP_BASE_URL + "/api/v1/register", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Connection': 'keep-alive'
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
    onAgreementScroll() {
      const el = this.$refs.agreementScroll;
      if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
        this.agreementScrolled = true;
      }
    },
    goToDialogAccess() {
      this.currentStep = 'dialog_access';
    },
  },
  watch: {
    async currentStep(val) {
      if (val === 'auth') {
        this.$nextTick(() => { this.renderVkButton(); });
      }
      if (val === 'dialog_access' && Script.getCookie('reg') === null) {
        this.currentStep = 'auth';
      }
    }
  }
};
</script>

<style scoped>
main {
  height: var(--full-height);
  overflow-y: auto;
  background: linear-gradient(135deg, #1a1a2e 0%, #23234b 100%);
  font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
}
.intro-full {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  width: 100vw;
  min-height: var(--full-height);
  background: linear-gradient(120deg, #23234b 0%, #1a1a2e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}
.intro-content {
  background: rgba(30, 30, 60, 0.98);
  border-radius: 32px;
  box-shadow: 0 0 32px 4px #667eea, 0 0 0 4px #23234b;
  padding: 48px 36px 36px 36px;
  text-align: center;
  max-width: 400px;
  border: 2px solid #764ba2;
}
.intro-content h1 {
  font-size: 2.5rem;
  margin-bottom: 18px;
  color: #f093fb;
  text-shadow: 0 0 10px #764ba2, 0 0 20px #667eea;
}
.intro-content p {
  font-size: 1.2rem;
  color: #fff;
  margin-bottom: 32px;
}
.btn-start {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 1.2rem;
  padding: 14px 36px;
  border: none;
  border-radius: 18px;
  box-shadow: 0 0 16px #667eea, 0 0 32px #764ba2;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  text-shadow: 0 0 8px #fff;
}
.btn-start:hover {
  background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 0 32px #f093fb, 0 0 48px #f5576c;
}

.agreement-full {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  width: 100vw;
  min-height: var(--full-height);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.agreement-full-scroll {
  width: 90vw;
  max-width: 700px;
  height: 60vh;
  max-height: 500px;
  border-radius: 24px;
  box-shadow: 0 0 32px 4px #667eea, 0 0 0 4px #23234b;
  padding: 32px 32px 24px 32px;
  margin-bottom: 24px;
  overflow-y: auto;
  border: 2px solid #764ba2;
  color: #fff;
  background-color: white;
}
.agreement-full-check {
  margin-bottom: 18px;
  font-size: 1.1rem;
  color: #f093fb;
  display: flex;
  align-items: center;
}
.btn-agreement {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 1.1rem;
  padding: 12px 32px;
  border: none;
  border-radius: 14px;
  box-shadow: 0 0 16px #667eea, 0 0 32px #764ba2;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  text-shadow: 0 0 8px #fff;
}
.btn-agreement:disabled {
  background: #3a3a5e;
  cursor: not-allowed;
  box-shadow: none;
}

.block {
  border-radius: 20px;
  background: #fff;
  padding: 40px 60px;
  max-width: 470px;
  width: 90%;
  margin: auto;
  text-align: left;
  box-shadow: 0 0 24px 2px #667eea22, 0 0 0 2px #764ba2;
  margin-top: 32px;
  margin-bottom: 32px;
  border: 2px solid #667eea;
}
.logo {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}
.logo img {
  max-width: 170px;
}
.auth p.text {
  margin: 30px 0;
  font-size: 1.2rem;
  text-align: center;
  padding: 0 60px;
  color: #23234b;
  font-weight: 600;
}
.block button, .btn {
  display: block;
  margin-top: 18px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  font-size: 1.1rem;
  padding: 12px;
  border: none;
  border-radius: 14px;
  color: white;
  width: 100%;
  box-shadow: 0 0 12px #667eea99, 0 0 24px #764ba288;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  text-shadow: 0 0 8px #fff8;
  font-weight: 600;
  text-decoration: none;
  text-align: center;
}
.btn.tinted{
  background: linear-gradient(90deg, #ff5e62 0%, #ff9966 100%);
  color: #fff;
  box-shadow: 0 0 16px #ff5e6299, 0 0 24px #ff996688;
}
.block button:hover, .btn:hover {
  background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 0 24px #f093fb99, 0 0 32px #f5576c88;
}
label{
  display: block;
  margin-bottom: 5px;
  font-size: 1.1rem;
  margin-top: 18px;
  color: black;
  font-weight: 600;
}
label.white{
  color: white;
  height: fit-content;
  margin: 0;
}
input, select{
  display: block;
  width: 100%;
  font-size: 1rem;
  border: 2px solid #667eea;
  border-radius: 10px;
  padding: 8px;
  margin-bottom: 8px;
  background: #fff;
  color: #23234b;
  transition: border 0.2s, box-shadow 0.2s;
  box-shadow: 0 0 6px #667eea22;
  font-weight: 500;
}
select{
  width: calc(100% - 20px);
}
input[type='checkbox']{
  display: inline;
  width: fit-content;
  height: fit-content;
  margin: 0;
  margin-right: 20px;
}
input:focus, select:focus {
  border: 2px solid #f093fb;
  outline: none;
  box-shadow: 0 0 12px #f093fb99;
}
select{
  width: 100%;
}
.dropdown {
  position: absolute;
  background: #fff;
  border: 2px solid #764ba2;
  max-height: 220px;
  overflow-y: auto;
  z-index: 10;
  list-style: none;
  margin: 0;
  padding: 0;
  box-shadow: 0 0 12px #667eea99;
}
.dropdown li {
  padding: 8px;
  cursor: pointer;
  transition: background 0.15s;
  color: #23234b;
  font-weight: 500;
}
.dropdown li:hover {
  background: #f093fb22;
}
.error {
  color: #f5576c;
  font-size: 12px;
  text-shadow: 0 0 6px #f093fb;
}
.invalid {
  border-color: #f5576c;
  box-shadow: 0 0 8px #f5576c;
}
.form-error {
  color: #f5576c;
  background: #fff0f6;
  border: 1px solid #f093fb;
  border-radius: 8px;
  padding: 10px 16px;
  margin-bottom: 16px;
  font-size: 1rem;
  text-align: center;
  text-shadow: 0 0 6px #f093fb;
}
@media (max-width: 768px) {
  .block{
    margin: 70px 0;
    padding: 20px 10px;
    width: 100vw;
    height: auto;
    overflow: auto;
  }
  .agreement-full-scroll {
    width: 98vw;
    padding: 12px 4vw 12px 4vw;
  }
}
</style>