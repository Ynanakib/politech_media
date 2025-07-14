<script setup>
import "regenerator-runtime/runtime"
import * as Script from "@/assets/scripts.js"
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute(); 
onMounted(async () => {
    (async ()=>{
        const id = route.params.id;

        //получение токена

        Script.LocalStorage.set("vk_tokens", JSON.stringify({
            type: "link",
            vk_id: id
        }))

        Script.LocalStorage.set("state", "reg")
        window.location.href = process.env.VUE_APP_BASE_URL + '/auth';
    })()
})
</script>