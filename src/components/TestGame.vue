<template>
  <div class="test-game">
    <!-- Основной фон -->
    <div class="background-container">
      <!-- Статичный фон -->
      <div
          class="background static-background"
          :style="{ backgroundImage: `url(${currentBackground})` }"
      ></div>

      <!-- Видео фон -->
      <video
          v-if="currentVideoBackground"
          ref="backgroundVideo"
          class="background video-background"
          :src="currentVideoBackground"
          autoplay
          muted
          playsinline
          @ended="onVideoEnded"
      ></video>
    </div>

    <!-- Интерфейс пользователя -->
    <div ref="userField" class="user-field">
      <!-- Приветствие персонажа (первый экран) -->
      <div v-if="currentStageData?.type === 'replica'" class="character-replica">
        <div class="character-message">
          <h2 class="character-name">{{ currentCharacter.name }}</h2>
          <p class="message-text">{{ currentStageData.text }}</p>
        </div>
        <button
            @click="handleProceed"
            type="button"
            class="continue-btn neon-button"
            :disabled="isTransitioning"
        >
          Продолжить
        </button>
      </div>

      <!-- Вопросы теста -->
      <div v-else-if="currentStageData?.type === 'question'" class="question-section">
        <div class="question-content">
          <h3 class="question-text">{{ currentStageData.question }}</h3>
          <div class="answers-grid">
            <button
                v-for="(text, key) in currentStageData.variants"
                :key="key"
                @click="handleAnswer(key)"
                type="button"
                class="answer-btn neon-button"
                :class="{ 'selected': selectedAnswer === key }"
                :disabled="isTransitioning || selectedAnswer !== null"
            >
              {{ text }}
            </button>
          </div>
        </div>
      </div>

      <!-- Завершение игры -->
      <div v-else-if="currentStageData?.type === 'game_completed'" class="game-completed">
        <div class="character-message">
          <h2 class="character-name">{{ currentCharacter.name }}</h2>
          <p class="message-text">{{ currentStageData.message }}</p>
        </div>
        <button
            @click="handleContinueToResults"
            class="continue-btn neon-button"
            :disabled="isTransitioning"
        >
          Узнать результат
        </button>
      </div>

      <!-- Состояние загрузки -->
      <div v-else-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p class="loading-text">Загрузка...</p>
      </div>

      <!-- Debug информация (удалить в продакшене) -->
      <div v-else class="debug-info" style="color: white; padding: 20px;">
        <p>Debug: currentStageData = {{ JSON.stringify(currentStageData, null, 2) }}</p>
      </div>
    </div>

    <!-- Персонаж -->
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
  </div>
</template>

<script>
import { GameCore, LocalStorage, CharacterFactory } from '@/assets/Script.js'

export default {
  name: 'TestGame',
  data() {
    return {
      gameManager: null,
      currentStageData: null,
      currentCharacter: null,
      loading: true,
      isTransitioning: false,
      selectedAnswer: null,
      characterExitSide: null,
      characterEnterSide: null,
      characterPosition: 'left',
      characterVisible: true,
      backgroundWidth: 375,
      currentVideoBackground: null,
      isVideoPlaying: false,
      userFieldHeight: 0,
      lastValidBackground: null,
      fallbackCharacter: {
        image: './media/img/characters/empty.png',
        name: '',
        backgroundImage: '',
        offsetPercentage: -0.075
      }
    }
  },

  computed: {
    // В TestGame.vue, замените computed свойство currentBackground:

    currentBackground() {
      // Сохраняем предыдущий фон, чтобы избежать мерцания
      if (!this.currentStageData) {
        return this.lastValidBackground || './media/img/backgrounds/main.png';
      }

      let background = null;

      // Проверяем динамический фон при выборе ответа
      if (this.selectedAnswer && this.currentStageData.dynamic) {
        const dynamicBg = this.currentStageData.dynamic[this.selectedAnswer];
        if (dynamicBg && !this.isVideoFile(dynamicBg)) {
          background = dynamicBg;
        }
      }

      // Для реплик персонажа после выбора группы факультетов используем его персональный фон
      if (!background && this.currentStageData.type === 'replica' && this.currentStageData.isGroupResponse) {
        background = this.currentCharacter?.backgroundImage;
      }

      // Статический фон
      if (!background && this.currentStageData.static && !this.isVideoFile(this.currentStageData.static)) {
        background = this.currentStageData.static;
      }

      // Если фон найден, сохраняем его как последний валидный
      if (background) {
        this.lastValidBackground = background;
        return background;
      }

      // Возвращаем последний валидный фон или дефолтный
      return this.lastValidBackground || './media/img/backgrounds/main.png';
    },

    characterImage() {
      if (this.currentCharacter?.image) {
        return this.currentCharacter.image;
      }
      return this.fallbackCharacter.image;
    },

    characterAnimationClasses() {
      const classes = [];
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

    characterStyles() {
      const baseStyles = {
        height: `${this.backgroundWidth * 0.9}px`,
        width: `${(this.backgroundWidth * 0.9) / 1.5}px`,
        opacity: this.characterVisible ? 1 : 0,
        pointerEvents: 'none',
        transition: 'all 0.5s ease-in-out'
      };

      const offsetPercentage = this.currentCharacter?.offsetPercentage || -0.075;
      const viewportHeight = window.innerHeight;
      const userFieldHeight = this.userFieldHeight || (viewportHeight * 0.35);
      const dynamicBottom = userFieldHeight + (viewportHeight * offsetPercentage);

      switch(this.characterPosition) {
        case 'left':
          return {
            ...baseStyles,
            left: '-10%',
            transform: 'translateX(0)',
            bottom: `${dynamicBottom}px`
          };
        case 'right':
          return {
            ...baseStyles,
            right: '-10%',
            left: 'auto',
            transform: 'translateX(0)',
            bottom: `${dynamicBottom}px`
          };
        case 'center':
          return {
            ...baseStyles,
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: `${dynamicBottom}px`
          };
        case 'hidden':
          return {
            ...baseStyles,
            display: 'none'
          };
        default:
          return baseStyles;
      }
    }
  },

  watch: {
    currentStageData: {
      handler() {
        this.$nextTick(() => {
          this.updateUserFieldHeight();
        });
      },
      deep: true
    }
  },

  mounted() {
    this.initializeGame();
    this.calcHeight();
    window.addEventListener('resize', this.calcHeight);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.calcHeight);
    this.cleanupVideo();
  },

  methods: {
    async initializeGame() {
      try {
        this.loading = true;

        this.gameManager = new GameCore({ offsetPercentage: -0.075 });
        await this.gameManager.initGame();

        const savedCharacter = LocalStorage.get('selectedCharacter');

        if (savedCharacter) {
          const characterData = JSON.parse(savedCharacter);
          const character = CharacterFactory.getCharacterById(characterData.id);

          if (character) {
            this.currentCharacter = character.getFullInfo();

            // Устанавливаем персонажа в GameCore
            this.gameManager.setCharacter(this.currentCharacter);

            // Получаем первый стейдж (приветствие)
            const firstStage = this.gameManager.getNextStage();

            if (firstStage) {
              this.currentStageData = firstStage;
              this.updateCharacterPosition();
            } else {
              console.error('No first stage received');
            }
          } else {
            console.error('Character not found in factory');
            this.$emit('no-character');
          }
        } else {
          console.error('No saved character');
          this.$emit('no-character');
        }

        this.loading = false;
      } catch (error) {
        console.error('Failed to initialize game:', error);
        this.loading = false;
        this.$emit('no-character');
      }
    },

    async handleAnswer(answerKey) {
      if (this.isTransitioning) return;

      this.selectedAnswer = answerKey;
      this.isTransitioning = true;

      try {
        // Обновляем фон при выборе ответа
        await this.updateBackgroundMedia();

        // Ждем окончания видео если оно играет
        if (this.isVideoPlaying) {
          await this.waitForVideoEnd();
        }

        await this.animateCharacterExit();

        // Получаем следующий стейдж
        const nextStage = this.gameManager.processAnswer(answerKey);

        if (!nextStage) {
          // Игра завершена
          const finalFaculty = this.gameManager.getFinalResult();

          if (this.currentCharacter && finalFaculty) {
            this.currentStageData = {
              type: 'game_completed',
              message: this.currentCharacter.finalLine || "Поздравляем! Вы прошли тест!",
              result: {
                finalFaculty: finalFaculty,
                totalAnswered: this.gameManager.rootQuestionsLength
              }
            };
            this.updateCharacterPosition();
            this.handleGameComplete();
          }
        } else {
          this.currentStageData = nextStage;
          this.updateCharacterPosition();
        }

        this.selectedAnswer = null;
        await this.updateBackgroundMedia();
        await this.animateCharacterEnter();
        this.isTransitioning = false;

      } catch (error) {
        console.error('Failed to process answer:', error);
        this.isTransitioning = false;
      }
    },

    async handleProceed() {
      if (this.isTransitioning) return;

      // Проверяем, нужно ли запустить приветственное видео
      if (this.currentStageData?.type === 'replica' && this.currentStageData?.dynamic) {
        this.currentVideoBackground = this.currentStageData.dynamic;
        this.isVideoPlaying = true;
        await this.$nextTick();

        if (this.$refs.backgroundVideo) {
          try {
            await this.$refs.backgroundVideo.play();
            await this.waitForVideoEnd();
          } catch (error) {
            console.error('Failed to play greeting video:', error);
          }
        }
      }

      this.isTransitioning = true;

      try {
        await this.animateCharacterExit();

        const nextStage = this.gameManager.getNextStage();

        if (!nextStage) {
          const finalFaculty = this.gameManager.getFinalResult();

          if (this.currentCharacter && finalFaculty) {
            this.currentStageData = {
              type: 'game_completed',
              message: this.currentCharacter.finalLine || "Поздравляем! Вы прошли тест!",
              result: {
                finalFaculty: finalFaculty,
                totalAnswered: this.gameManager.rootQuestionsLength
              }
            };
            this.updateCharacterPosition();
            this.handleGameComplete();
          }
        } else {
          this.currentStageData = nextStage;
          this.updateCharacterPosition();
        }

        await this.updateBackgroundMedia();
        await this.animateCharacterEnter();
        this.isTransitioning = false;

      } catch (error) {
        console.error('Failed to process proceed action:', error);
        this.isTransitioning = false;
      }
    },

    // Методы для работы с видео
    isVideoFile(url) {
      if (!url) return false;
      const videoExtensions = ['.mp4', '.webm', '.ogg'];
      return videoExtensions.some(ext => url.toLowerCase().includes(ext));
    },

    async updateBackgroundMedia() {
      let mediaUrl = null;

      // Определяем какой медиа-файл использовать
      if (this.selectedAnswer && this.currentStageData?.dynamic) {
        mediaUrl = this.currentStageData.dynamic[this.selectedAnswer];
      } else if (this.currentStageData?.static) {
        mediaUrl = this.currentStageData.static;
      }

      if(mediaUrl == this.currentBackground){
        return
      }

      this.cleanupVideo();

      // Если это видео, устанавливаем его
      if (mediaUrl && this.isVideoFile(mediaUrl)) {
        this.currentVideoBackground = mediaUrl;
        this.isVideoPlaying = true;

        await this.$nextTick();

        if (this.$refs.backgroundVideo) {
          try {
            await this.$refs.backgroundVideo.play();
          } catch (error) {
            console.error('Failed to play video:', error);
            this.isVideoPlaying = false;
          }
        }
      } else {
        this.currentVideoBackground = null;
        this.isVideoPlaying = false;
      }
    },

    onVideoEnded() {
      this.isVideoPlaying = false;
      if (this.currentStageData?.static && !this.isVideoFile(this.currentStageData.static)) {
        this.currentVideoBackground = null;
      }
    },

    async waitForVideoEnd() {
      if (!this.$refs.backgroundVideo || !this.isVideoPlaying) return;

      return new Promise((resolve) => {
        const video = this.$refs.backgroundVideo;

        const handleEnd = () => {
          video.removeEventListener('ended', handleEnd);
          resolve();
        };

        if (video.ended) {
          resolve();
          return;
        }

        video.addEventListener('ended', handleEnd);

        // Таймаут на случай если видео зависло
        setTimeout(() => {
          video.removeEventListener('ended', handleEnd);
          resolve();
        }, 5000);
      });
    },

    cleanupVideo() {
      if (this.$refs.backgroundVideo) {
        this.$refs.backgroundVideo.pause();
        this.$refs.backgroundVideo.src = '';
      }
      this.currentVideoBackground = null;
      this.isVideoPlaying = false;
    },

    // Анимации персонажа
    async animateCharacterExit() {
      return Promise.resolve();
    },

    async animateCharacterEnter() {
      return Promise.resolve();
    },

    updateCharacterPosition() {
      const stage = this.currentStageData?.type;
      const stageInfo = this.currentStageData?.stageInfo;

      // Расширенная карта позиций
      const positionMap = {
        // Реплики персонажа
        'replica': 'left',
        'game_completed': 'center',

        // Вопросы
        'question': (() => {
          if (!stageInfo) return 'left';

          if (stageInfo.stage === 'root') {
            const positions = ['left', 'hidden', 'hidden', 'hidden', 'right', 'hidden'];
            return positions[stageInfo.index] || 'left';
          } else if (stageInfo.stage === 'appended') {
            return 'left';
          } else if (stageInfo.stage === 'groups') {
            return 'hidden';
          }

          return 'left';
        })()
      };

      this.characterPosition = positionMap[stage] || 'left';
      this.characterVisible = this.characterPosition !== 'hidden';
    },

    handleGameComplete() {
      if (this.currentStageData?.result) {
        LocalStorage.set('gameResult', JSON.stringify(this.currentStageData.result));
      }
    },

    handleContinueToResults() {
      this.$emit('game-completed', this.gameManager.finalFaculty);
    },

    calcHeight() {
      this.backgroundWidth = document.body.offsetWidth;
      this.updateUserFieldHeight();
    },

    updateUserFieldHeight() {
      this.$nextTick(() => {
        if (this.$refs.userField) {
          const newHeight = this.$refs.userField.offsetHeight;
          if (newHeight !== this.userFieldHeight) {
            this.userFieldHeight = newHeight;
            this.$forceUpdate();
          }
        }
      });
    }
  }
}
</script>

<style scoped>
.test-game {
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  position: relative;
  background-color: #00023b;
  display: flex;
  flex-direction: column;
  -webkit-overflow-scrolling: touch;
  user-select: none;
}

.background-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vw;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.video-background {
  width: 100vw;
  height: 100vw;
  object-fit: cover;
}

.character-field {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 10;
  transition: all 0.5s ease-in-out;
}

.character-image {
  width: 100%;
  height: 100%;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: bottom center;
  opacity: 1;
  transition: all 0.8s ease-in-out;
  animation: character-idle 6s ease-in-out infinite;
  animation-delay: 1.5s;
}

.user-field {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  min-height: calc(100vh - 100vw);
  height: fit-content;
  background: linear-gradient(to top,
  rgba(0, 2, 59, 0.98) 0%,
  rgba(0, 2, 59, 0.95) 70%,
  rgba(0, 2, 59, 0.85) 100%);
  backdrop-filter: blur(10px);
  z-index: 15;
  padding: clamp(15px, 3vh, 30px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-top: 2px solid rgba(0, 255, 255, 0.3);
  overflow-y: auto;
}

.character-replica,
.question-section,
.game-completed {
  text-align: center;
  color: white;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.character-message {
  margin-bottom: clamp(15px, 3vh, 30px);
}

.character-name {
  font-size: clamp(1.2rem, 4vw, 2rem);
  margin-bottom: clamp(8px, 2vh, 15px);
  color: #0ff;
  text-shadow: 0 0 10px #0ff;
}

.message-text {
  color: white;
  font-size: clamp(0.95rem, 3.5vw, 1.2rem);
  line-height: 1.5;
  margin-bottom: clamp(15px, 3vh, 20px);
  padding: 0 10px;
}

.question-content {
  width: 100%;
  padding: 0;
  color: white;
}

.question-text {
  color: #fff;
  font-size: clamp(1rem, 3.2vw, 1.3rem);
  margin-bottom: clamp(15px, 2.5vh, 25px);
  padding: 0 10px;
  line-height: 1.4;
}

.answers-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: clamp(8px, 1.5vh, 15px);
  padding: 0 clamp(10px, 2vw, 20px);
  margin-bottom: clamp(10px, 2vh, 20px);
}

.answer-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: clamp(8px, 1.8vh, 20px) clamp(10px, 2.2vw, 25px);
  border-radius: clamp(15px, 3vw, 25px);
  font-size: clamp(0.9rem, 3.2vw, 1.1rem);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1.3;
}

.answer-btn:active {
  transform: scale(0.98);
}

.answer-btn.selected {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  transform: scale(1.02);
  box-shadow: 0 0 30px rgba(240, 147, 251, 0.7);
}

.answer-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.continue-btn {
  padding: clamp(12px, 2.5vh, 18px) clamp(30px, 8vw, 50px);
  font-size: clamp(1rem, 3.5vw, 1.2rem);
  font-weight: bold;
  background: linear-gradient(45deg, #f0f, #ff00ff);
  color: white;
  border: none;
  border-radius: clamp(20px, 4vw, 30px);
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  min-height: 48px;
  margin: 0 auto;
}

.continue-btn:active {
  transform: scale(0.98);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 20px;
}

.loading-spinner {
  width: clamp(40px, 10vw, 60px);
  height: clamp(40px, 10vw, 60px);
  border: 3px solid #0ff;
  border-top: 3px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-text {
  font-size: clamp(1rem, 3.5vw, 1.2rem);
  color: #0ff;
}

.debug-info {
  font-size: 0.8rem;
  background: rgba(255, 0, 0, 0.2);
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
}

/* Анимации */
.character-exit-left {
  animation: characterExitLeft 0.5s ease-in-out forwards;
}

.character-enter-left {
  animation: characterEnterLeft 0.5s ease-in-out forwards;
}

@keyframes characterExitLeft {
  0% { transform: translateX(-50%); opacity: 1; }
  100% { transform: translateX(-150%); opacity: 0; }
}

@keyframes characterEnterLeft {
  0% { transform: translateX(-150%); opacity: 0; }
  100% { transform: translateX(-50%); opacity: 1; }
}

@keyframes character-idle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Мобильная адаптация */
@media (max-width: 480px) {
  .answers-grid {
    grid-template-columns: 1fr;
  }

  .character-field {
    width: 60vw;
    height: 40vh;
  }
}

@media (max-height: 500px) and (orientation: landscape) {
  .user-field {
    min-height: 50vh;
    max-height: 100vh;
  }

  .answers-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
  }
}
</style>