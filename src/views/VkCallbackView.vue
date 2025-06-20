<script setup>
import "regenerator-runtime/runtime"
import * as Script from "@/assets/scripts.js"
import { onMounted } from 'vue';
import * as VKID from "@vkid/sdk";
onMounted(async () => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const device_id = url.searchParams.get('device_id');
    const state = url.searchParams.get('state');
    
    const randomLength = Math.floor(Math.random() * 86) + 43;
    const codeVerifier = generateRandomString(randomLength);

    VKID.Config.init({
        app: process.env.VUE_APP_VKAPP_ID,
        state: state,
        codeVerifier: codeVerifier,
        redirectUrl: process.env.VUE_APP_BASE_URL + '/vk-callback',
        mode: VKID.ConfigAuthMode.Redirect
    })

    VKID.Auth.exchangeCode(code, device_id)
    .then( obj => fetch(process.env.VUE_APP_BASE_URL + '/api/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            access_token: obj.access_token,
            refresh_token: obj.refresh_token,
            user_id: obj.user_id
        })
    }))
    .catch((result)=>{
        window.location.href = process.env.VUE_APP_BASE_URL+'/auth'
        return result
    })
    .then( result => result.json() )
    .then( result => { 
        Script.setCookie("token", result.token)
        return result
    })
    .finally((result)=> {
        if(result.result){
            window.location.href = process.env.VUE_APP_BASE_URL+'/testing'
        }
    })
})
function generateRandomString(length = 64) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randIndex = Math.floor(Math.random() * chars.length);
    result += chars[randIndex];
  }
  return result;
}
</script>