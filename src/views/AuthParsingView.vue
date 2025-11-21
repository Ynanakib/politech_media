<script setup>
import "regenerator-runtime/runtime"
import * as Script from '@/assets/Script.js'
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute(); 
onMounted(async () => {
    (async ()=>{
        const _token = route.params.id;

        let correct = await fetch(process.env.VUE_APP_BASE_URL + "/api/v2/token/check", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Connection': 'keep-alive'
            },
            body: JSON.stringify({
                token : _token
            })
        }).then((response) => response.json()).then(response => response.result)

        if(correct == true){
            let user_id = await fetch(process.env.VUE_APP_BASE_URL + "/api/v2/verify-auth-token", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Connection': 'keep-alive'
                },
                body: JSON.stringify({
                    auth_token : _token
                })
            })
            .then(request => request.json())
            .then(request => request.vk_id)
            
            let tokens = {
                type: "link",
                vk_id: user_id,
                is_admin: false
            }
            Script.LocalStorage.set("vk_tokens", JSON.stringify(tokens))

            const response = await fetch(process.env.VUE_APP_BASE_URL + '/api/v1/auth', {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                    'Connection' : 'keep-alive'
                },
                body: JSON.stringify(tokens)
            })

            const result = await response.json();

            if (response.status === 202){
                fetch(process.env.VUE_APP_BASE_URL + "/api/v2/token/destroy", {
                    method: "POST",
                    headers: {
                        'Content-Type' : 'application/json',
                        'Connection' : 'keep-alive'
                    },
                    body: JSON.stringify({
                        token: _token
                    })    
                })

                Script.LocalStorage.set("token", result.token);

                const is_admin = await fetch(process.env.VUE_APP_BASE_URL + '/api/v2/is-admin', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        token: result.token
                    })
                }).then(e=>e.json()).then(e=>e.is_admin)
                
                tokens.is_admin = is_admin

                Script.LocalStorage.set("vk_tokens", JSON.stringify(tokens))

                window.location.href = process.env.VUE_APP_BASE_URL + '/testing';
            }else{
                if(response.status === 201){

                    fetch(process.env.VUE_APP_BASE_URL + "/api/v2/token/destroy", {
                        method: "POST",
                        headers: {
                            'Content-Type' : 'application/json',
                            'Connection' : 'keep-alive'
                        },
                        body: JSON.stringify({
                            token: _token
                        })    
                    })

                    Script.LocalStorage.set("vk_tokens", JSON.stringify(tokens))
                    Script.LocalStorage.set("state", "reg");
                    window.location.href = process.env.VUE_APP_BASE_URL + '/auth';
                }else{
                    fetch(process.env.VUE_APP_BASE_URL + "/api/v2/token/destroy", {
                        method: "POST",
                        headers: {
                            'Content-Type' : 'application/json',
                            'Connection' : 'keep-alive'
                        },
                        body: JSON.stringify({
                            token: _token
                        })    
                    })

                    window.location.href = process.env.VUE_APP_BASE_URL + '/';
                    console.error("Ошибка авторизации")
                }
            } 

        }else{
            Script.LocalStorage.set("state", "auth")
            window.location.href = process.env.VUE_APP_BASE_URL + '/auth';
        }
    })()
})
</script>