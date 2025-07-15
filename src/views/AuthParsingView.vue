<script setup>
import "regenerator-runtime/runtime"
import * as Script from "@/assets/scripts.js"
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
                vk_id: user_id
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