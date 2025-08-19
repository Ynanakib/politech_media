<template>
  <div class="test-game">
    <div class="background" :style="{ backgroundImage: `url(${currentBackground})` }">

    </div>
    <!-- Character Field -->
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

    <!-- Dynamic Object Overlay -->
    <div 
      v-if="dynamicObject"
      class="dynamic-object"
      :class="dynamicObjectAnimationClasses"
      :style="dynamicObjectStyles"
    >
      <img 
        :src="dynamicObject.image" 
        :alt="dynamicObject.trigger"
        class="dynamic-object-image"
      />
    </div>

    <!-- Interactive User Field -->
    <div class="user-field">
      <!-- Character Replica Section -->
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
          Да, продолжить
        </button>
      </div>

      <!-- Character Response Section -->
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

      <!-- Question Section -->
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

      <!-- Game Completed Section -->
      <div v-else-if="currentStageData?.type === 'game_completed'" class="game-completed">
        <div class="character-message">
          <h2 class="character-name">{{ currentStageData.character.name }}</h2>
          <p class="message-text">{{ currentStageData.message }}</p>
        </div>
        <!-- <div class="result-info">
          <p class="result-text">Ваш результат: {{ getFacultyName(currentStageData.result.branchGroup) }}</p>
          <p class="result-detail">Факультет: {{ currentStageData.result.branch }}</p>
        </div> -->
        <button 
          @click="handleContinueToResults"
          class="continue-btn neon-button"
          :disabled="isTransitioning"
        >
          Продолжить
        </button>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p class="loading-text">Загрузка...</p>
      </div>
    </div>

    <!-- Transition Overlay -->
    <div 
      v-if="false"
      class="transition-overlay"
      :class="transitionClasses"
    ></div>
  </div>
</template>

<script>
import { GameStateManager } from '@/assets/logic.js';
import { CharacterFactory } from '@/assets/newScript.js';
import { LocalStorage } from '@/assets/scripts.js';

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
      dynamicObjectVisible: false,
      fallbackCharacter: {
        image: './media/img/characters/empty.png',
        name: '',
        backgroundImage: ''
      }
    };
  },
  computed: {
    currentBackground() {
      if(this.currentStageData?.type === 'game_completed' || this.currentStageData?.type === 'character_response'){
        return this.currentStageData?.character?.backgroundImage;
      }else{
        return this.currentStageData?.background || './media/img/backgrounds/main.png';
      }
    },
    characterImage() {
      // Always use the selected character's image if available
      if (this.currentStageData?.character?.image) {
        return this.currentStageData.character.image;
      }
      // fallback only if no character at all
      return this.fallbackCharacter.image;
    },
    dynamicObject() {
      return this.currentStageData?.dynamicObject || null;
    },
    isQuestionStage() {
      return this.currentStageData?.type === 'general_question' || 
             this.currentStageData?.type === 'special_question';
    },
    characterAnimationClasses() {
      const classes = ['character-field'];
      
      if (this.isTransitioning) {
        if (this.characterExitSide) {
          classes.push(`character-exit-${this.characterExitSide}`);
        }
        if (this.characterEnterSide) {
          classes.push(`character-enter-${this.characterEnterSide}`);
        }
      }
      
      return classes;
    },
    dynamicObjectAnimationClasses() {
      const classes = ['dynamic-object'];
      
      if (this.dynamicObjectVisible) {
        classes.push('dynamic-object-visible');
        if (this.dynamicObject?.animation) {
          classes.push(`dynamic-object-${this.dynamicObject.animation}`);
        }
      }
      
      return classes;
    },
    transitionClasses() {
      return ['transition-overlay'];
    },
    characterStyles() {
      const styles = {};
      
      if (this.dynamicObject?.position) {
        styles.left = this.dynamicObject.position.x || '50%';
        styles.top = this.dynamicObject.position.y || '50%';
      }
      
      return styles;
    },
    dynamicObjectStyles() {
      const styles = {};
      
      if (this.dynamicObject?.position) {
        styles.left = this.dynamicObject.position.x || '50%';
        styles.top = this.dynamicObject.position.y || '50%';
      }
      
      return styles;
    }
  },
  async mounted() {
    await this.initializeGame();
  },
  methods: {
    async initializeGame() {
      try {
        this.loading = true;
        // Initialize game manager
        this.gameManager = new GameStateManager();
        await this.gameManager.initialize();

        // Try to restore progress
        const savedProgress = LocalStorage.get('gameProgress');
        const savedCharacter = LocalStorage.get('selectedCharacter');
        if (savedProgress && savedCharacter) {
          // Restore game state from localStorage
          this.restoreProgressFromLocalStorage();
        } else if (savedCharacter) {
          // No progress, but character selected
          const characterData = JSON.parse(savedCharacter);
          const character = CharacterFactory.getCharacterById(characterData.id);
          if (character) {
            await this.startGame(character);
          } else {
            this.$emit('no-character');
          }
        } else {
          this.$emit('no-character');
        }
        this.loading = false;
      } catch (error) {
        console.error('Failed to initialize game:', error);
        this.loading = false;
        this.$emit('no-character');
      }
    },

    restoreProgressFromLocalStorage() {
      // This assumes gameManager is initialized and LocalStorage has valid data
      // The gameManager.getCurrentData() will reflect the restored state
      let data = this.gameManager.getCurrentData();
      // Если этап character_replica, явно получаем данные для этого этапа
      if (data?.type === 'character_replica' || !data) {
        if (this.gameManager && this.gameManager.testingLogic && typeof this.gameManager.testingLogic.getCharacterReplicaData === 'function') {
          data = this.gameManager.testingLogic.getCharacterReplicaData();
        }
      }
      this.currentStageData = data;
      // Критично: обновляем gameManager.currentData для корректной работы processAction
      this.gameManager.currentData = data;
      // Patch character info if needed
      const savedCharacter = LocalStorage.get('selectedCharacter');
      if (savedCharacter && this.currentStageData) {
        const charData = JSON.parse(savedCharacter);
        const character = CharacterFactory.getCharacterById(charData.id);
        if (character && (!this.currentStageData.character || this.currentStageData.character.id !== character.id)) {
          this.currentStageData.character = character.getFullInfo();
        }
      }
    },
    
    async startGame(character) {
      try {
        // Check if there's saved progress
        const savedProgress = LocalStorage.get('gameProgress');
        if (savedProgress) {
          // Restore game state
          this.currentStageData = this.gameManager.getCurrentData();
          // Patch character if missing (for old saves)
          if (!this.currentStageData?.character?.image) {
            this.currentStageData.character = character.getFullInfo();
          }
        } else {
          // Start new game
          this.currentStageData = await this.gameManager.startGame(character);
        }
        // Always ensure the selected character is used for all stages
        if (this.currentStageData && this.currentStageData.character && this.currentStageData.character.id !== character.id) {
          this.currentStageData.character = character.getFullInfo();
        }
        this.animateCharacterEnter();
      } catch (error) {
        console.error('Failed to start game:', error);
      }
    },
    
    async handleAnswer(answerKey) {
      if (this.isTransitioning) return;
      this.selectedAnswer = answerKey;
      this.isTransitioning = true;
      try {
        await this.animateCharacterExit();
        if (this.dynamicObject) {
          await this.showDynamicObject();
        }
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
    },
    
    async animateCharacterExit() {
      return new Promise((resolve) => {
        // Only left and right movement allowed
        const sides = ['left']; //'right'
        this.characterExitSide = sides[Math.floor(Math.random() * sides.length)];
        
        // Animate exit
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
    
    async showDynamicObject() {
      return new Promise((resolve) => {
        this.dynamicObjectVisible = true;
        
        setTimeout(() => {
          this.dynamicObjectVisible = false;
          resolve();
        }, 2000); // Show dynamic object for 2 seconds
      });
    },
    
    handleGameComplete() {
      // Save final result
      if (this.currentStageData?.result) {
        LocalStorage.set('gameResult', JSON.stringify(this.currentStageData.result));
      }
    },
    
    handleContinueToResults() {
      // Emit game completion event
      this.$emit('game-completed', this.currentStageData.result.totalAnswered || 0);
    },
    
    getFacultyName(branchGroup) {
      const facultyNames = {
        'akf/mtf': 'Авиационный и машиностроительный факультет',
        'sf/idst': 'Строительный факультет / Институт дорожного строительства и транспорта',
        'fpmm/etf/gumf': 'Факультет прикладной математики и механики / Электротехнический факультет / Гуманитарный факультет',
        'htf/gnf': 'Химико-технологический факультет / Геологический факультет'
      };
      
      return facultyNames[branchGroup] || branchGroup;
    }
  }
};
</script>

<style scoped>
.test-game {
  width: 100vw;
  height: var(--full-height);
  overflow: hidden;
  position: relative;
  background-color: #00023b;
  display: flex;
  flex-direction: column;
  background-size: cover;
  -webkit-overflow-scrolling: touch;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.background{
  width: 100%;
  height: calc(100% - 220px);
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
}

/* Character Field */
.character-field {
  position: absolute;
  left: 0;
  top: 0;
  width: 40%;
  height: calc(100vh - 220px);
  min-height: 400px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 10;
  transition: all 0.8s ease-in-out;
  background: transparent;
}

.character-image {
  position: relative;
  height: 100%;
  width: 100%;
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

/* Character Exit Animations */
.character-exit-left {
  animation: characterExitLeft 0.5s ease-in-out forwards;
}

.character-exit-right {
  animation: characterExitRight 0.5s ease-in-out forwards;
}

/* Character Enter Animations */
.character-enter-left {
  animation: characterEnterLeft 0.5s ease-in-out forwards;
}

.character-enter-right {
  animation: characterEnterRight 0.5s ease-in-out forwards;
}

/* Dynamic Object */
.dynamic-object {
  position: absolute;
  z-index: 20;
  opacity: 0;
  transform: scale(0);
  transition: all 0.5s ease-in-out;
  pointer-events: none;
}

.dynamic-object-visible {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}

.dynamic-object-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Dynamic Object Animations */
.dynamic-object-bounce {
  animation: dynamicObjectBounce 2s ease-in-out;
}

.dynamic-object-rotate {
  animation: dynamicObjectRotate 2s ease-in-out;
}

.dynamic-object-fade {
  animation: dynamicObjectFade 2s ease-in-out;
}

/* User Field */
.user-field {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100vw;
  min-height: 250px;
  background: black;
  text-align: center;
  flex: 0 0 auto;
  z-index: 15;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  padding: 16px;
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

/* Transition Overlay */
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

/* Animations */
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

@keyframes dynamicObjectBounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0) scale(1); }
  40% { transform: translateY(-30px) scale(1.1); }
  60% { transform: translateY(-15px) scale(1.05); }
}

@keyframes dynamicObjectRotate {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.2); }
  100% { transform: rotate(360deg) scale(1); }
}

@keyframes dynamicObjectFade {
  0% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0; transform: scale(1); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 900px) {
  .test-game {
    height: 100vh;
    overflow: hidden;
  }
  
  .character-field {
    width: 50%;
    height: calc(100vh - 200px);
    min-height: 350px;
  }
  
  .character-image {
    height: 100%;
    width: 100%;
    background-size: contain;
    background-position: bottom center;
  }
  
  .user-field {
    min-height: 200px;
    padding: 20px 15px;
  }
  
  .question-content {
    width: 90%;
    max-width: 600px;
    padding: 20px 15px;
  }
  
  .question-text {
    font-size: 18px;
    margin-bottom: 15px;
  }
  
  .answers-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .answer-btn {
    padding: 12px 20px;
    font-size: 14px;
    min-height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .character-name {
    font-size: 1.6rem;
    margin-bottom: 10px;
  }
  
  .message-text {
    font-size: 1rem;
    line-height: 1.5;
  }
  
  .continue-btn {
    padding: 12px 30px;
    font-size: 1rem;
    min-height: 45px;
  }
  
  .result-info {
    padding: 15px;
    margin: 15px 0;
  }
  
  .result-text {
    font-size: 1.1rem;
  }
  
  .result-detail {
    font-size: 1rem;
  }
}

@media (max-width: 600px) {
  .character-field {
    width: 60%;
    height: calc(100vh - 180px);
    min-height: 300px;
  }
  
  .character-image {
    height: 100%;
    width: 100%;
  }
  
  .user-field {
    min-height: 180px;
    padding: 15px 10px;
  }
  
  .question-content {
    width: 95%;
    padding: 15px 10px;
  }
  
  .question-text {
    font-size: 16px;
    margin-bottom: 12px;
  }
  
  .answers-grid {
    gap: 10px;
  }
  
  .answer-btn {
    padding: 10px 15px;
    font-size: 13px;
    min-height: 45px;
    border-radius: 20px;
  }
  
  .character-name {
    font-size: 1.4rem;
    margin-bottom: 8px;
  }
  
  .message-text {
    font-size: 0.9rem;
    line-height: 1.4;
  }
  
  .continue-btn {
    padding: 10px 25px;
    font-size: 0.9rem;
    min-height: 40px;
  }
  
  .result-info {
    padding: 12px;
    margin: 12px 0;
  }
  
  .result-text {
    font-size: 1rem;
  }
  
  .result-detail {
    font-size: 0.9rem;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    margin-bottom: 15px;
  }
  
  .loading-text {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .character-field {
    width: 70%;
    height: calc(100vh - 160px);
    min-height: 250px;
  }
  
  .character-image {
    height: 100%;
    width: 100%;
  }
  
  .user-field {
    min-height: 160px;
    padding: 12px 8px;
  }
  
  .question-content {
    width: 98%;
    padding: 12px 8px;
  }
  
  .question-text {
    font-size: 15px;
    margin-bottom: 10px;
  }
  
  .answers-grid {
    gap: 8px;
  }
  
  .answer-btn {
    padding: 8px 12px;
    font-size: 12px;
    min-height: 40px;
    border-radius: 18px;
  }
  
  .character-name {
    font-size: 1.2rem;
    margin-bottom: 6px;
  }
  
  .message-text {
    font-size: 0.85rem;
    line-height: 1.3;
  }
  
  .continue-btn {
    padding: 8px 20px;
    font-size: 0.85rem;
    min-height: 35px;
  }
  
  .result-info {
    padding: 10px;
    margin: 10px 0;
  }
  
  .result-text {
    font-size: 0.9rem;
  }
  
  .result-detail {
    font-size: 0.8rem;
  }
  
  .loading-spinner {
    width: 35px;
    height: 35px;
    margin-bottom: 12px;
  }
  
  .loading-text {
    font-size: 0.9rem;
  }
}

@media (max-width: 360px) {
  .character-field {
    width: 80%;
    height: calc(100vh - 140px);
    min-height: 200px;
  }
  
  .user-field {
    min-height: 140px;
    padding: 10px 6px;
  }
  
  .question-content {
    width: 100%;
    padding: 10px 6px;
  }
  
  .question-text {
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  .answer-btn {
    padding: 6px 10px;
    font-size: 11px;
    min-height: 35px;
    border-radius: 15px;
  }
  
  .character-name {
    font-size: 1.1rem;
    margin-bottom: 5px;
  }
  
  .message-text {
    font-size: 0.8rem;
    line-height: 1.2;
  }
  
  .continue-btn {
    padding: 6px 16px;
    font-size: 0.8rem;
    min-height: 30px;
  }
  
  .result-info {
    padding: 8px;
    margin: 8px 0;
  }
  
  .result-text {
    font-size: 0.85rem;
  }
  
  .result-detail {
    font-size: 0.75rem;
  }
}

/* Touch-friendly improvements for mobile */
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

/* Safe area support for devices with notches */
@supports (padding: max(0px)) {
  .test-game {
    padding-top: max(0px, env(safe-area-inset-top));
    padding-bottom: max(0px, env(safe-area-inset-bottom));
    padding-left: max(0px, env(safe-area-inset-left));
    padding-right: max(0px, env(safe-area-inset-right));
  }
  
  .user-field {
    padding-bottom: max(30px, env(safe-area-inset-bottom) + 30px);
  }
}

/* Reduce motion for users who prefer it */
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

/* Prevent zoom on input focus for iOS */
@media screen and (-webkit-min-device-pixel-ratio: 0) {
  .answer-btn,
  .continue-btn {
    font-size: 16px;
  }
}

/* Landscape orientation adjustments */
@media (max-width: 900px) and (orientation: landscape) {
  .character-field {
    width: 40%;
    height: calc(100vh - 120px);
    min-height: 200px;
  }
  
  .user-field {
    min-height: 120px;
    padding: 10px 15px;
  }
  
  .question-content {
    padding: 10px 15px;
  }
  
  .question-text {
    font-size: 16px;
    margin-bottom: 8px;
  }
  
  .answers-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  
  .answer-btn {
    padding: 8px 12px;
    font-size: 12px;
    min-height: 35px;
  }
  
  .character-name {
    font-size: 1.2rem;
    margin-bottom: 5px;
  }
  
  .message-text {
    font-size: 0.9rem;
    line-height: 1.3;
  }
  
  .continue-btn {
    padding: 8px 20px;
    font-size: 0.9rem;
    min-height: 30px;
  }
}
</style>
