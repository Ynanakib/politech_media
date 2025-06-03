<template>
    <main>
        <p>{{ facultates[result] }}</p>
        <router-link to="/testing">Пройти тест еще раз</router-link>
    </main>
</template>

<script>
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
    mounted(){
        this.result = localStorage.getItem('result')
    }
}
</script>