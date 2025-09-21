<template>
    <div class="test-container" v-if="currentQuestion">
        <video 
            v-if="backgroundSrc"
            class="bg-video"
            :key="backgroundKey"
            :src="backgroundSrc"
            :poster="posterSrc"
            autoplay
            muted
            playsinline
            loop
        />

        <div class="content" v-if="currentQuestion.type == 'question'">
            <div class="answers">
                <button 
                    v-for="(text, key) in currentQuestion.variants" 
                    :key="key"
                    @click="handlePressing(key)"
                    @pointerup="handlePressing(key)"
                    type="button"
                    class="answer-btn neon-button"
                    :class="{ 'selected': selectedAnswer === key }"
                    :disabled="isTransitioning || selectedAnswer !== null"
                >
                    {{ text }}
                </button>
            </div>
        </div>

        <div class="content replica" v-else-if="currentQuestion.type == 'replica'">
            <p>{{ replicaText }}</p>
            <button class="answer-btn neon-button continue-btn" @click="goNextReplica">Далее</button>
        </div>
    </div>
</template>

<script>

import { CharacterFactory, GameCore, LocalStorage } from '@/assets/Script';

export default{
    name: "HelpMePlease",
    data(){
        return{
            selectedCharacter: null,
            gameCore: null,
            currentQuestion: null,
            generator: null,
            isTransitioning: false,
            selectedAnswer: null,
            backgroundSrc: '',
            posterSrc: '',
            backgroundKey: 0
        }
    },
    computed: {
        replicaText(){
            if(!this.currentQuestion || this.currentQuestion.type !== 'replica') return ''
            const txt = this.currentQuestion.text
            if(typeof txt === 'string'){
                // e.g. greeting
                return this.selectedCharacter[txt] || ''
            }
            if(Array.isArray(txt) && txt.length === 2){
                const [field, key] = txt
                return this.selectedCharacter[field] && this.selectedCharacter[field][key]
                    ? this.selectedCharacter[field][key]
                    : ''
            }
            return ''
        }
    },
    beforeMount(){
        const saved = LocalStorage.get("selectedCharacter")
        this.selectedCharacter = CharacterFactory.getCharacterByName(JSON.parse(saved).name)
        this.gameCore = new GameCore(this.selectedCharacter)
        this.gameCore.loadQuestions().then(()=>{
            this.generator = this.gameCore.generateQuestions()
            this.advance()
        })
    },
    methods:{
        resolveStatic(question){
            if(!question) return ''
            if(question.static) return question.static
            if(question.staticBackground) return question.staticBackground
            return ''
        },
        resolveDynamic(question, answerKey){
            if(!question) return ''
            const dyn = question.dynamic || question.dynamicBackground
            if(!dyn) return this.resolveStatic(question)
            if(typeof dyn === 'string') return dyn
            if(answerKey && dyn[answerKey]) return dyn[answerKey]
            return this.resolveStatic(question)
        },
        setBackgroundForCurrent(question){
            const poster = this.resolveStatic(question)
            this.posterSrc = poster
            // For question state show a video in the background (use static as "idle" video if it's a video/gif path)
            this.backgroundSrc = poster
            this.backgroundKey++
        },
        advance(input){
            const nextVal = input === undefined ? this.generator.next() : this.generator.next(input)
            this.currentQuestion = nextVal.value
            this.selectedAnswer = null
            if(this.currentQuestion){
                // default background for the current step
                this.setBackgroundForCurrent(this.currentQuestion)
            }
        },
        async handlePressing(answerKey){
            if(this.isTransitioning || !this.currentQuestion || this.currentQuestion.type !== 'question') return
            this.isTransitioning = true
            this.selectedAnswer = answerKey

            // show animation video for selected answer
            const animSrc = this.resolveDynamic(this.currentQuestion, answerKey)
            this.backgroundSrc = animSrc
            this.backgroundKey++

            // small delay to let animation show before moving on
            setTimeout(()=>{
                this.advance(answerKey)
                this.isTransitioning = false
            }, 600)
        },
        goNextReplica(){
            if(this.isTransitioning) return
            this.advance()
        }
    }
}

</script>

<style scoped>
.test-container{
    position: relative;
    width:100%; 
    height: 100vh;
    overflow: hidden;
    background: #000;
}
.bg-video{
    position:absolute;
    inset:0;
    width:100%;
    height:100%;
    object-fit: cover;
}
.content{
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width:100%;
    height:100%;
    padding: 24px;
    box-sizing: border-box;
    color: white;
}
.answers{
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
    width: 100%;
    max-width: 960px;
}
.answer-btn{
    padding: 12px 16px;
    font-size: 16px;
}
.replica p{
    max-width: 960px;
    font-size: 20px;
    line-height: 1.4;
    text-align: center;
}
.continue-btn{
    margin-top: 16px;
}
</style>