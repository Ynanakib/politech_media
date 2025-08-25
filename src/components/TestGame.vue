<template>
  <div class="test-game">
    <div class="user-field">
      <div v-if="currentStageData?.type === 'character_replica'" class="character-replica">
        <div class="character-message">
          <h2 class="character-name">{{ currentStageData.character.name }}</h2>
          <p class="message-text">{{ currentStageData.message }}</p>
        </div>
        <button 
          @click="handleProceed"
          @pointerup="handleProceed"
          type="button"
          class="continue-btn neon-button"
          :disabled="isTransitioning"
        >
          Продолжить
        </button>
      </div>
      <div v-else-if="currentStageData?.type === 'character_response'" class="character-response">
        <div class="character-message">
          <h2 class="character-name">{{ currentStageData.character.name }}</h2>
          <p class="message-text">{{ currentStageData.message }}</p>
        </div>
        <button 
          @click="handleProceed"
          @pointerup="handleProceed"
          type="button"
          class="continue-btn neon-button"
          :disabled="isTransitioning"
        >
          Продолжить
        </button>
      </div>
      <div v-else-if="isQuestionStage" class="question-section">
        <div class="question-content">
          <h3 class="question-text">{{ currentStageData.question }}</h3>
          <div class="answers-grid">
            <button 
              v-for="answer in currentStageData.answers" 
              :key="answer.key"
              @click="handleAnswer(answer.key)"
              @pointerup="handleAnswer(answer.key)"
              type="button"
              class="answer-btn neon-button"
              :class="{ 'selected': selectedAnswer === answer.key }"
              :disabled="isTransitioning || selectedAnswer !== null"
            >
              {{ answer.text }}
            </button>
          </div>
        </div>
      </div>
      <div v-else-if="currentStageData?.type === 'game_completed'" class="game-completed">
        <div class="character-message">
          <h2 class="character-name">{{ currentStageData.character.name }}</h2>
          <p class="message-text">{{ currentStageData.message }}</p>
        </div>
        <button 
          @click="handleContinueToResults"
          class="continue-btn neon-button"
          :disabled="isTransitioning"
        >
          Продолжить
        </button>
      </div>
      <div v-else-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p class="loading-text">Загрузка...</p>
      </div>
    </div>

    <div class="background" :style="{ 
      backgroundImage: `url(${currentBackground})`, 
      width: `${console.log(this.backgroundWidth) ? 0 : this.backgroundWidth}px`, 
      height: `${this.backgroundWidth}px`
    }">
      <!-- <div v-if="currentStageData?.type === 'character_replica'" class="dynamicObject politeh" :style="{ backgroundImage: `url(./media/img/backgrounds/main.png)` }"></div>

      <div v-if="isQuestionStage && this.gameManager.getCurrentQuestionNumber() === 1" class="bookshelf" :style="{ backgroundImage: `url(./media/img/dynamic/bookshelf.png)` }"></div>
      <div v-if="isQuestionStage && this.gameManager.getCurrentQuestionNumber() === 1" class="dynamicObject book" :style="{ 
          backgroundImage: `url(./media/img/dynamic/book.png)`,
          top: `${ -0.91 * this.backgroundWidth}px`,
          left: `${ 1.228 * this.backgroundWidth}px`
        }"></div>

        <div v-if="isQuestionStage && this.gameManager.getCurrentQuestionNumber() === 2" class="dynamicObject maneken" :style="{ 
          backgroundImage: `url(./media/img/dynamic/maneken1.png)` ,
          left: `${this.backgroundWidth * 0.5}px`,
          top: `${ 0.55 * this.backgroundWidth}px`,
          width: `${this.backgroundWidth / 11.52}px`,
          height: `${this.backgroundWidth / 5.76}px`
        }"></div>
        <div v-if="isQuestionStage && this.gameManager.getCurrentQuestionNumber() === 2" class="dynamicObject maneken" :style="{ 
          backgroundImage: `url(./media/img/dynamic/maneken2.png)` ,
          left: `${this.backgroundWidth * 0.65}px`,
          top: `${ 0.55 * this.backgroundWidth-100}px`,
          width: `${this.backgroundWidth / 11.52}px`,
          height: `${this.backgroundWidth / 5.76}px`
        }"></div>
        <div v-if="isQuestionStage && this.gameManager.getCurrentQuestionNumber() === 2" class="dynamicObject maneken" :style="{ 
          backgroundImage: `url(./media/img/dynamic/maneken3.png)` ,
          left: `${this.backgroundWidth * 0.8}px`,
          top: `${ 0.55 * this.backgroundWidth-200}px`,
          width: `${this.backgroundWidth / 11.52}px`,
          height: `${this.backgroundWidth / 5.76}px`
        }"></div>
        <div v-if="isQuestionStage && this.gameManager.getCurrentQuestionNumber() === 2" class="dynamicObject maneken" :style="{ 
          backgroundImage: `url(./media/img/dynamic/maneken4.png)` ,
          left: `${this.backgroundWidth * 0.95}px`,
          top: `${ 0.55 * this.backgroundWidth-300}px`,
          width: `${this.backgroundWidth / 11.52}px`,
          height: `${this.backgroundWidth / 5.76}px`
        }"></div> -->

    </div>
    <div 
      class="character-field"
      :class="characterAnimationClasses"
      :style="characterStyles"
    >
      <div 
        class="character-image"
        :style="{ backgroundImage: `url(${characterImage})` }"
      ></div>
    </div>
    <div 
      v-if="false"
      class="transition-overlay"
      :class="transitionClasses"
    ></div>
  </div>
</template>

<script>
import { GameStateManager } from '@/assets/logic.js'
import { CharacterFactory } from '@/assets/newScript.js'
import { LocalStorage } from '@/assets/scripts.js'

export default {
  name: 'TestGame',
  data() {
    return {
      gameManager: null,
      currentStageData: null,
      loading: true,
      isTransitioning: false,
      selectedAnswer: null,
      characterExitSide: null,
      characterEnterSide: null,
      backgroundWidth: 375,
      fallbackCharacter: {
        image: './media/img/characters/empty.png',
        name: '',
        backgroundImage: ''
      },
      windowWidth: window.innerWidth,
      manekens: [true, true, true, true],
      exposition: [true, true, true, true]
    }
  },
  computed: {
    currentBackground() {
      if(this.currentStageData?.type === 'game_completed' || this.currentStageData?.type === 'character_response'){
        return this.currentStageData?.character?.backgroundImage
      }else{
        return this.currentStageData?.background || './media/img/backgrounds/main.png'
      }
    },
    characterImage() {
      if (this.currentStageData?.character?.image) {
        return this.currentStageData.character.image
      }
      return this.fallbackCharacter.image
    },
    isQuestionStage() {
      return this.currentStageData?.type === 'general_question' || 
             this.currentStageData?.type === 'special_question'
    },
    characterAnimationClasses() {
      const classes = ['character-field']
      
      if (this.isTransitioning) {
        if (this.characterExitSide) {
          classes.push(`character-exit-${this.characterExitSide}`)
        }
        if (this.characterEnterSide) {
          classes.push(`character-enter-${this.characterEnterSide}`)
        }
      }
      
      return classes
    },
    transitionClasses() {
      return ['transition-overlay']
    },
    characterStyles() {
      const styles = {}
      styles.top = ``
      styles.height = `${this.backgroundWidth+20}px`
      styles.width = `${(this.backgroundWidth+20)/1.5}px`
      return styles
    }
  },
  beforeMount() {
    this.initializeGame();    
  },
  methods: {
    async initializeGame() {
      try {
        this.loading = true
        this.gameManager = new GameStateManager()
        await this.gameManager.initialize()
        const savedProgress = LocalStorage.get('gameProgress')
        const savedCharacter = LocalStorage.get('selectedCharacter')
        if (savedProgress && savedCharacter) {
          this.restoreProgressFromLocalStorage()
        } else if (savedCharacter) {
          const characterData = JSON.parse(savedCharacter)
          const character = CharacterFactory.getCharacterById(characterData.id)
          if (character) {
            await this.startGame(character)
          } else {
            this.$emit('no-character')
          }
        } else {
          this.$emit('no-character')
        }
        this.loading = false

      } catch (error) {
        console.error('Failed to initialize game:', error)
        this.loading = false
        this.$emit('no-character')
      }
      this.calcHeight()
    },

    restoreProgressFromLocalStorage() {
      let data = this.gameManager.getCurrentData()
      if (data?.type === 'character_replica' || !data) {
        if (this.gameManager && this.gameManager.testingLogic && typeof this.gameManager.testingLogic.getCharacterReplicaData === 'function') {
          data = this.gameManager.testingLogic.getCharacterReplicaData()
        }
      }
      this.currentStageData = data
      this.gameManager.currentData = data
      const savedCharacter = LocalStorage.get('selectedCharacter')
      if (savedCharacter && this.currentStageData) {
        const charData = JSON.parse(savedCharacter)
        const character = CharacterFactory.getCharacterById(charData.id)
        if (character && (!this.currentStageData.character || this.currentStageData.character.id !== character.id)) {
          this.currentStageData.character = character.getFullInfo()
        }
      }
    },
    
    async startGame(character) {
      try {
        const savedProgress = LocalStorage.get('gameProgress')
        if (savedProgress) {
          this.currentStageData = this.gameManager.getCurrentData()
          if (!this.currentStageData?.character?.image) {
            this.currentStageData.character = character.getFullInfo()
          }
        } else {
          this.currentStageData = await this.gameManager.startGame(character)
        }
        if (this.currentStageData && this.currentStageData.character && this.currentStageData.character.id !== character.id) {
          this.currentStageData.character = character.getFullInfo()
        }
        this.animateCharacterEnter()
      } catch (error) {
        console.error('Failed to start game:', error)
      }
    },
    
    async handleAnswer(answerKey) {
      if (this.isTransitioning) return;
      this.selectedAnswer = answerKey;
      this.isTransitioning = true;
      try {
        if (this.gameManager && this.gameManager.getCurrentQuestionNumber() === 2) {
          const { updateGroupFlags } = await import('@/assets/logic.js')
          updateGroupFlags(this.manekens, answerKey)
        }
        await this.animateCharacterExit();
        await this.animateCurrentQuestion();
        if (this.dynamicObject) {
          await this.showDynamicObject();
        }
        this.calcHeight()
        // Process answer
        const nextData = await this.gameManager.processAction('answer', answerKey);
        // Always patch character to selected one if missing or wrong
        const savedCharacter = LocalStorage.get('selectedCharacter');
        let selectedChar = null;
        if (savedCharacter) {
          const charData = JSON.parse(savedCharacter);
          selectedChar = CharacterFactory.getCharacterById(charData.id);
        }
        if (selectedChar && (!nextData.character || nextData.character.id !== selectedChar.id)) {
          nextData.character = selectedChar.getFullInfo();
        }
        this.currentStageData = nextData;
        this.selectedAnswer = null;
        await this.animateCharacterEnter();
        this.isTransitioning = false;
        if (nextData.type === 'game_completed') {
          this.handleGameComplete();
        }
      } catch (error) {
        console.error('Failed to process answer:', error);
        this.isTransitioning = false;
      }
      this.calcHeight()
    },
    
    async handleProceed() {
      if (this.isTransitioning) return;
      // Если после восстановления currentData вдруг null, выставим его вручную
      if (!this.gameManager.currentData && this.currentStageData) {
        this.gameManager.currentData = this.currentStageData;
      }
      this.isTransitioning = true;
      try {
        await this.animateCharacterExit();
        await this.animateCurrentQuestion();
        const nextData = await this.gameManager.processAction('proceed');
        // Always patch character to selected one if missing or wrong
        const savedCharacter = LocalStorage.get('selectedCharacter');
        let selectedChar = null;
        if (savedCharacter) {
          const charData = JSON.parse(savedCharacter);
          selectedChar = CharacterFactory.getCharacterById(charData.id);
        }
        if (selectedChar && (!nextData.character || nextData.character.id !== selectedChar.id)) {
          nextData.character = selectedChar.getFullInfo();
        }
        this.currentStageData = nextData;
        if (this.gameManager && this.gameManager.testingLogic) {
          this.gameManager.testingLogic.saveGameProgress();
        }
        await this.animateCharacterEnter();
        this.isTransitioning = false;
        if (nextData.type === 'game_completed') {
          this.handleGameComplete();
        }
      } catch (error) {
        console.error('Failed to process proceed action:', error);
        this.isTransitioning = false;
      }
      this.calcHeight()
    },
    
    async animateCharacterExit() {
      return new Promise((resolve) => {
        const sides = ['left']; //'right'
        this.characterExitSide = sides[Math.floor(Math.random() * sides.length)];
        setTimeout(() => {
          resolve();
        }, 800);
      });
    },
    
    async animateCharacterEnter() {
      return new Promise((resolve) => {
        // Character must return from the same side it left
        this.characterEnterSide = this.characterExitSide;
        
        // Animate enter
        setTimeout(() => {
          this.characterExitSide = null;
          this.characterEnterSide = null;
          resolve();
        }, 800);
      });
    },
    
    handleGameComplete() {
      if (this.currentStageData?.result) {
        LocalStorage.set('gameResult', JSON.stringify(this.currentStageData.result))
      }
    },
    
    handleContinueToResults() {
      this.$emit('game-completed', this.currentStageData.result.totalAnswered || 0)
    },

    calcHeight(){
      this.backgroundWidth = document.getElementsByTagName("body")[0].offsetWidth
    },
    
    async animateCurrentQuestion(){
      return new Promise((resolve)=>{
        let question = {
          time: 0,
          postProcess: false
        }
        if(this.currentStageData?.type !== 'character_response'){
          if(this.currentStageData?.type === 'character_replica'){
            question = {
              tag: "politeh",
              time: 5000,
              postProcess: true
            }
          }else{
            switch(this.gameManager.getCurrentQuestionNumber()){
            case 1:
              question.tag = "book"
              question.time = 0//5000
              document.getElementsByClassName("book")[0].style.top = "-50%"
              document.getElementsByClassName("book")[0].style.left = "50%"
              document.getElementsByClassName("book")[0].style.zIndex = 3
              break;
            case 2:
              question.tag = "maneken"
              question.time = 0//3000
              let manekens = document.getElementsByClassName("maneken")
              for(let i = 0; i<4; i++){
                manekens[i].classList.remove("animated")
                if(!this.manekens[i]){
                  manekens[i].classList.add("animated")
                }
              }
              question.postProcess = false;
              break;
            case 3:
              question.tag = ""
              question.time = 0
              break;
            case 4:
              question.tag = ""
              question.time = 0
              break;
            case 5:
              question.tag = ""
              question.time = 0
              break;
            case 6:
              question.tag = ""
              question.time = 0
              break;
            case 7:
              question.tag = ""
              question.time = 0
              break;
            default:
              question.tag = "politeh"
              question.time = 0// 5000
              break;
          }
          }
        }
        if(question.postProcess){
          const targetEl = document.getElementsByClassName(question.tag)[0]
          if (!targetEl) {
            resolve();
            return;
          }
          targetEl.classList.remove("animated")
          targetEl.classList.add("animated")
        }
        setTimeout(() => {
          resolve();
        }, question.time)
      })
    }
  }
}
</script>

<style scoped>
.test-game {
  width: 100vw;
  height: var(--full-height);
  /* height: 100vh; */
  overflow: hidden;
  position: relative;
  background-color: #00023b;
  display: flex;
  flex-direction: column-reverse;
  background-size: cover;
  -webkit-overflow-scrolling: touch;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.background{
  margin: 0 auto;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.character-field {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 10;
  transition: all 0.8s ease-in-out;
  background: transparent;
}

.character-image {
  width: 100%;
  height: 100%;
  position: relative;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: bottom;
  opacity: 1;
  transition: all 0.8s ease-in-out;
  animation: character-idle 4s ease-in-out infinite;
  animation-delay: 1.5s;
  will-change: transform;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}

.character-exit-left {
  animation: characterExitLeft 0.5s ease-in-out forwards;
}

.character-exit-right {
  animation: characterExitRight 0.5s ease-in-out forwards;
}

.character-enter-left {
  animation: characterEnterLeft 0.5s ease-in-out forwards;
}

.character-enter-right {
  animation: characterEnterRight 0.5s ease-in-out forwards;
}

.user-field {
  width: 100vw;
  min-height: 250px;
  background: #00023b;
  text-align: center;
  flex: 0 0 auto;
  z-index: 15;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-top: black 5px solid;
}

.character-replica,
.character-response,
.question-section,
.game-completed {
  text-align: center;
  color: white;
}

.character-message {
  margin-bottom: 30px;
}

.character-name {
  font-size: 2rem;
  margin-bottom: 15px;
  color: #0ff;
  text-shadow: 0 0 10px #0ff;
}

.message-text {
  color: white;
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 20px;
}

.question-content {
  display: inline-block;
  padding: 0;
  color: white;
  margin: 0;
  border-radius: 20px;
  width: 50vw;
  align-self: center;
  z-index: 10;
  position: relative;
  max-width: 800px;
}

.question-text {
  color: #fff;
  font-size: 20px;
  margin-bottom: 20px;
}

.answers-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.answer-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 25px;
  border-radius: 25px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Arial', sans-serif;
  text-align: left;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 20px #667eea;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.answer-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 
    0 0 30px #667eea,
    0 0 50px #667eea;
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.answer-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.answer-btn.selected {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  transform: scale(1.05);
  box-shadow: 
    0 0 30px #f093fb,
    0 0 50px #f093fb;
}


.continue-btn,
.finish-btn {
  padding: 15px 40px;
  font-size: 1.2rem;
  font-weight: bold;
  background: linear-gradient(45deg, #f0f, #ff00ff);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 20px #f0f;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.continue-btn:hover:not(:disabled),
.finish-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 0 30px #f0f;
}

.continue-btn:disabled,
.finish-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.result-info {
  margin: 20px 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  border: 1px solid #0ff;
}

.result-text {
  font-size: 1.3rem;
  color: #0ff;
  margin-bottom: 10px;
}

.result-detail {
  font-size: 1.1rem;
  color: #fff;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #0ff;
  border-top: 3px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-text {
  font-size: 1.2rem;
  color: #0ff;
}

.transition-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 25;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.transition-answer {
  opacity: 1;
}

.transition-proceed {
  opacity: 1;
}

@keyframes characterExitLeft {
  0% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(-100%); opacity: 0; }
}

@keyframes characterExitRight {
  0% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
}

@keyframes characterEnterLeft {
  0% { transform: translateX(-100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

@keyframes characterEnterRight {
  0% { transform: translateX(100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

@keyframes character-idle {
  0% { transform: translateY(0) translateZ(0); }
  50% { transform: translateY(-12px) translateZ(0); }
  100% { transform: translateY(0) translateZ(0); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 380px){

  .user-field {
    height: 40%;
    padding: 5px;
    justify-content: start;
  }
  
  .question-content {
    width: 98%;
    padding: 12px 8px;
    height: 100%;
  }
  
  .question-text {
    margin-bottom: 10px;
    font-size: 16px;
  }
  
  .answers-grid {
    margin-bottom: 0px;
    height: 85%;
    grid-template-rows: repeat(4, 1fr);
  }
  
  .answer-btn {
    padding: 8px 12px;
    min-height: 35px;
    height: 100%;
    border-radius: 18px;
    font-size: 14px;
  }
  .character-name {
    margin-bottom: 6px;
  }

  .continue-btn {
    padding: 8px 20px;
    min-height: 35px;
  }
  
  .result-info {
    padding: 10px;
    margin: 10px 0;
  }
  
  .loading-spinner {
    width: 35px;
    height: 35px;
    margin-bottom: 12px;
  }
}

@media (max-width: 431px){
  .user-field {
    height: 40%;
    padding: 5px;
    justify-content: start;
  }
  
  .character-field{
    top: 150px; 
    left: -50px
  }
  .question-content{
    width: 100%;
  }

  .answers-grid{
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, 1fr);
    height: 100%;
    width: 100%;
  }
}


@media (hover: none) and (pointer: coarse) {
  .answer-btn {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  
  .answer-btn:active {
    transform: scale(0.98);
    transition: transform 0.06s ease;
  }
  
  .continue-btn {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  
  .continue-btn:active {
    transform: scale(0.98);
    transition: transform 0.06s ease;
  }
}

@media (prefers-reduced-motion: reduce) {
  .character-image {
    animation: none;
  }
  
  .character-field,
  .character-image,
  .dynamic-object {
    transition: none;
  }
  
  .answer-btn,
  .continue-btn {
    transition: none;
  }
  
  .answer-btn:hover:not(:disabled),
  .continue-btn:hover:not(:disabled) {
    transform: none;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  
  .user-field {
    min-height: 120px;
    padding: 5px;
  }
  
  .question-content {
    padding: 10px 15px;
  }
  
  .question-text {
    margin-bottom: 8px;
  }
  
  .answers-grid {
    grid-template-columns: repeat(2, 1fr);
    margin-bottom: 0px;
    gap: 8px;
  }
  
  .answer-btn {
    padding: 8px 12px;
    font-size: 12px;
    min-height: 35px;
  }
  
  .character-name {
    margin-bottom: 5px;
  }
  
  .continue-btn {
    padding: 8px 20px;
    min-height: 30px;
  }
}

.dynamicObject{
  position: relative;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}
.bookshelf{
  position: sticky;
  width: 100%;
  height: 100%;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: 50%;
  z-index: 3;
}
.book{  
  z-index: 1;
  transition: all;
  transition-duration: 3s;
  rotate: 64grad;
  width: 200px;
  height: 140px;
}
.book.animated{
  rotate: 0grad;
  left: 50%;
  top: -50%
}
.politeh.animated{
  width: 600%;
  margin-left: -250%;
  background-position: 50% 80%;
}
.politeh{
  transition: all;
  transition-duration: 5s;
  width: 100%;
  height: 100%;
}
.maneken{
  transition: all;
  transition-duration: 2s;
}
.maneken.animated{
  opacity: 0;
}
</style>
