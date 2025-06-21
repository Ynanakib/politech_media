<script setup>
import "regenerator-runtime/runtime"
import * as Script from "@/assets/scripts.js"
import { onMounted } from 'vue';
import * as VKID from "@vkid/sdk";
onMounted(async () => {
    (async ()=>{
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const device_id = url.searchParams.get('device_id');
        const state = url.searchParams.get('state');
        
        const randomLength = Math.floor(Math.random() * 86) + 43;
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
        let codeVerifier = '';
        for (let i = 0; i < randomLength; i++) {
            const randIndex = Math.floor(Math.random() * chars.length);
            codeVerifier += chars[randIndex];
        }

        VKID.Config.init({
            app: process.env.VUE_APP_VKAPP_ID,
            state: state,
            codeVerifier: codeVerifier,
            redirectUrl: process.env.VUE_APP_BASE_URL + '/vk-callback',
            mode: VKID.ConfigAuthMode.Redirect
        })

        try {
            const obj = await VKID.Auth.exchangeCode(code, device_id);
            let tokens = {
                access_token: obj.access_token,
                refresh_token: obj.refresh_token,
                user_id: obj.user_id
            };
            Script.setCookie("vk_tokens", JSON.stringify(tokens));
            const response = await fetch(process.env.VUE_APP_BASE_URL + '/api/v1/auth', {
                method: 'POST',
                headers: { 'Content-Type' : 'application/json' },
                body: JSON.stringify(tokens)
            });
            const result = await response.json();
            Script.setCookie("token", result.token);

            if (response.status === 201) {
                Script.setCookie("reg", "1");
                window.location.href = process.env.VUE_APP_BASE_URL + '/auth';
                return;
            }else{
                window.location.href = process.env.VUE_APP_BASE_URL + '/testing';
            }

        } catch (error) {
            console.error("Ошибка при аутентификации:", error);
        }
    })()
})
</script>