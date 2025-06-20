<template>
    <main>
        <p>{{ facultates[result] }}</p>
        <router-link to="/testing">Пройти тест еще раз</router-link>
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
            }
        }
    },
    beforeCreate(){
        
    },
    mounted(){
        this.result = Script.getCookie('result')
    }
}
</script>

<style scoped>
main{
    width: 600px;
    height: 600px;
}
</style>