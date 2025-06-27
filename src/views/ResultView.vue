<template>
    <main>
        <div class="result-display">
            <p>{{ facultates[result] }}</p>
            <router-link to="/testing">Пройти тест еще раз</router-link>
            <div id="video"></div>
        </div>
    </main>
</template>

<script>
import "regenerator-runtime/runtime"
import * as Script from "@/assets/scripts.js"
export default{
    data(){
        return {
            result: "",
            facultates: {
                "etf": "Электротехнический факультет",
                "fpmm": "Факультет прикладной математики и механики",
                "gumf": "Гуманитарный факультет",
                "akf": "Аэрокосмический факультет",
                "mtf": "Механико-технологический факультет",
                "sf": "Строительный факультет",
                "idst": "Институт доржного строительства и транспорта",
                "htf": "Факультет химических технологий, промышленной экологии и биотехнологий",
                "gnf": "Горно-нефтяной факультет",
            },
            video: {
                oid : "",
                id : ""
            }
        }
    },
    beforeCreate(){
        fetch(process.env.VUE_APP_BASE_URL + "/api/v1/media/videos")
        .then( result => result.json())
        .then( json => json.videos)
        .then( ( array = [] ) => {
            for (let i = 0; i < array.length; i++) {
                const el = array[i];
                if(el.title == this.result) return el
            }
        })
        .then(el => {
            let data = el.url.split("/")[3].split("_")
            let oid = data[0].substr(5)
            let id = data[1]
            this.video.oid = oid;
            this.video.id = id;
            return 1
        })
        .then(()=>{
            let container = document.getElementById("video");
            let inFrame = document.createElement("iframe")
            
            let width = 600;
            let height = width*0.5693950178;

            inFrame.setAttribute("src", "https://vkvideo.ru/video_ext.php?oid=" + this.video.oid + "&id=" + this.video.id + "&hd=2&autoplay=1")
            inFrame.setAttribute("width", width)
            inFrame.setAttribute("height", height)
            inFrame.setAttribute("allow", "autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;")
            inFrame.setAttribute("frameborder", "0")
            inFrame.setAttribute("allowfullscreen", "")

            container.appendChild(inFrame);
        })
    },
    mounted(){
        this.result = Script.getCookie('result')
    }
}
</script>

<style scoped>
.result-display{
    width: 600px;
    height: 600px;
    margin: auto;
}
main {
  display: grid;
  height: 100vh;
}
</style>