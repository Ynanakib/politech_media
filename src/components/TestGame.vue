<template>
  <div class="test-game" :style="{ backgroundImage: `url(${currentBackground})` }">
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
          class="continue-btn neon-button"
          :disabled="isTransitioning"
        >
          Продолжить
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
        <div class="result-info">
          <p class="result-text">Ваш результат: {{ getFacultyName(currentStageData.result.branchGroup) }}</p>
          <p class="result-detail">Факультет: {{ currentStageData.result.branch }}</p>
        </div>
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
        image: './media/img/characters/dasha.png',
        name: 'Даша'
      }
    };
  },
  computed: {
    currentBackground() {
      return this.currentStageData?.background || './media/img/backgrounds/main.png';
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
        // Сохраняем прогресс на этапе character_replica
        if (nextData.type === 'character_replica' && this.gameManager && this.gameManager.testingLogic) {
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
        const sides = ['left', 'right'];
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
}

.dynamic-object-visible {
  opacity: 1;
  transform: scale(1);
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
  0% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
  100% { transform: translateY(0); }
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
  .answer-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 20px #667eea;
  }
  
  .character-field {
    background-size: cover;
  }
  
  .character-image {
    position: relative;
    height: 100vh;
    width: 80vw;
    bottom: 220px;
  }
  
  .question-content {
    display: block;
    padding: 6px;
    width: 100%;
  }
}

@media (max-width: 600px) {
  .response-text {
    font-size: 1rem;
  }
  
  .response-box {
    padding: 20px;
    margin: 10px;
  }
  
  .continue-btn {
    padding: 12px 30px;
    font-size: 1rem;
  }
  
  .character-field {
    background-size: cover;
  }
  
  .character-image {
    position: relative;
    height: 100vh;
    width: 120vw;
  }
  
  .answers-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }
  
  .question-text {
    font-size: 16px;
  }
  
  .answer-btn {
    font-size: 13px;
    padding: 10px 16px;
    width: 100%;
  }
  
  .question-content {
    display: block;
    padding: 6px;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .character-field {
    background-size: cover;
  }
  
  .character-image {
    bottom: 220px;
    height: 100vh;
    width: 100%;
  }
  
  .question-content {
    display: block;
    padding: 6px;
    width: 100%;
  }
}
</style>
