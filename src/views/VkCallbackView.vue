<script setup>
import { onMounted } from 'vue';
import * as VKID from "@vkid/sdk";
onMounted(async () => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const device_id = url.searchParams.get('device_id');
    const state = url.searchParams.get('state');
    
    const randomLength = Math.floor(Math.random() * (128 - 43 + 1)) + 43;
    const codeVerifier = generateRandomString(randomLength);

    VKID.Config.init({
        app: 53548686,
        state: state,
        codeVerifier: codeVerifier,
        redirectUrl: window.BASE_URL+'/vk-callback'
    })
    VKID.Auth.exchangeCode(code, device_id)
    .then( obj => {
        let arr = JSON.stringify({
            access_token: obj.access_token,
            refresh_token: obj.refresh_token,
            user_id: obj.user_id
        })
        return arr
    })
    .then( arr => fetch('/api/v1/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: arr
    }))
    .then( result => result.json() )
    .then( result => localStorage.setItem("token", result.token))
    .finally(()=> {
        window.location.href = window.BASE_URL+'/testing'
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