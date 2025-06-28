import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

createApp(App).use(store).use(router).mount('#app')

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) 
                  || /iP(ad|od|hone)/i.test(navigator.userAgent);
  
if (isSafari) {
    document.getElementById("app").classList.add('is-safari');
}else{
    document.getElementById("app").classList.add('not-safari');
}
