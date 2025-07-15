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
            scope: 'email messages phone groups vkid.personal_info',
            mode: VKID.ConfigAuthMode.Redirect
        })

        try {
            const obj = await VKID.Auth.exchangeCode(code, device_id);
            let tokens = {
                type: "vk",
                access_token: obj.access_token,
                refresh_token: obj.refresh_token,
                vk_id: obj.user_id
            };
            let userInfo = await VKID.Auth.userInfo(tokens.access_token);
            Script.LocalStorage.set("user_info", JSON.stringify(userInfo.user))
            Script.LocalStorage.set("vk_tokens", JSON.stringify(tokens));

            const response = await fetch(process.env.VUE_APP_BASE_URL + '/api/v1/auth', {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                    'Connection' : 'keep-alive'
                },
                body: JSON.stringify(tokens)
            });
            const result = await response.json();

            if (response.status === 202){
                Script.LocalStorage.set("token", result.token);
                window.location.href = process.env.VUE_APP_BASE_URL + '/testing';
            }else{
                if(response.status === 201){
                    Script.LocalStorage.set("state", "reg");
                    window.location.href = process.env.VUE_APP_BASE_URL + '/auth';
                }else{
                    window.location.href = process.env.VUE_APP_BASE_URL + '/';
                    console.error("Ошибка авторизации")
                }
            } 
        } catch (error) {
            if(error.error == "invalid_request"){
                window.location.href = process.env.VUE_APP_BASE_URL + '/';
            }
            console.error("Ошибка при аутентификации:", error);
        }
    })()
})
</script>