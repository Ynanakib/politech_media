<template>
  <div class="visual-novel">
    <!-- Top: Background and Character -->
    <div class="top-section" :style="{ backgroundImage: `url(${currentBackground})` }">
      <div 
          class="character" 
          :class="{ 'character-enter': characterVisible }"
          :style="{ 
            backgroundImage: `url(${characterImage})`,
            right: characterPosition + '%'
          }"
        ></div>
    </div>
    <!-- Bottom: Question and Answers -->
    <div class="bottom-section">
      <div class="dialogue-box" v-if="currentQuestionData && currentQuestionData.dialogue">
        <p class="dialogue-text">{{ currentQuestionData.dialogue }}</p>
      </div>
      <div class="question-section" v-if="currentQuestionData && currentQuestionData.question">
        <h3 class="question">{{ currentQuestionData.question }}</h3>
        <div class="answers">
          <button 
            v-for="answer in currentAnswers" 
            :key="answer.key"
            @click="selectAnswer(answer.key)"
            class="answer-btn neon-button"
            :class="{ 'selected': selectedAnswer === answer.key }"
            :disabled="isTransitioning"
          >
            {{ answer.text }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as Script from "@/assets/scripts.js"
export default {
  name: 'VisualNovel',
  data() {
    return {
      characterVisible: false,
      characterPosition: 80,
      selectedAnswer: null,
      loading: true,
      isTransitioning: false,
      characterImage: null,
      allQuestions: null,
      currentQuestions: [],
      currentQuestionIndex: 0,
      gameState: 'root_questions', // root_questions, group_questions, tiebreaker, done
      branchScores: {},
      dominantBranchGroup: null,
      dominantBranch: null,
      totalAnswered: 0,
      totalQuestions: 0,
      tiebreakerGroups: [],
      tiebreakerQuestion: null
    }
  },
  computed: {
    currentQuestionData() {
      if (this.gameState === 'tiebreaker') {
        return this.tiebreakerQuestion;
      }
      return this.currentQuestions[this.currentQuestionIndex] || null;
    },
    currentAnswers() {
      if (!this.currentQuestionData) return [];
      if (this.gameState === 'tiebreaker') {
        const tiedGroupKeys = this.tiebreakerGroups.map(g => g.key);
        // Filter variants from the appended_question based on the tied groups.
        return Object.entries(this.currentQuestionData.variants)
          .filter(([key]) => tiedGroupKeys.includes(key))
          .map(([key, text]) => ({ key, text }));
      }
      return Object.entries(this.currentQuestionData.variants).map(([key, text]) => ({ key, text }));
    },
    currentBackground() {
      // First 6 questions: always main.png
      if (this.gameState === 'root_questions' && this.currentQuestionIndex < 6) {
        return './media/img/backgrounds/main.png';
      }
      // Tiebreaker: keep main.png
      if (this.gameState === 'tiebreaker') {
        return './media/img/backgrounds/main.png';
      }
      // After that, use group backgrounds
      const backgroundMap = {
        'akf/mtf': './media/img/backgrounds/mtf_akf.png',
        'sf/idst': './media/img/backgrounds/sf_idst.png',
        'fpmm/etf/gumf': './media/img/backgrounds/gumf_etf_fpmm.png',
        'htf/gnf': './media/img/backgrounds/gnf_htf.png'
      };
      return backgroundMap[this.dominantBranchGroup] || './media/img/backgrounds/sf_idst.png';
    }
  },
  async mounted() {
    await this.loadData();
    this.loadGameProgress();
    this.animateCharacter();
  },
  methods: {
    async loadData() {
      try {
        // const questionsResponse = await fetch(process.env.VUE_APP_BASE_URL + '/api/v1/media/questions');
        // this.allQuestions = await questionsResponse.json();
        this.allQuestions = JSON.parse(`{ "root": [ { "question": "Какие качества делают тебя сильнее?", "variants": { "akf/mtf" : "находчивость, умение быстро обучаться", "sf/idst" : "ловкость и аккуратность", "fpmm/etf/gumf" : "острый ум и креативность", "htf/gnf" : "смелость и энергичность" } }, { "question": "Какой образ тебе подходит?", "variants": { "akf/mtf" : "генератор идей, изобретатель", "sf/idst" : "на все руки мастер", "fpmm/etf/gumf" : "гений критического мышления", "htf/gnf" : "любитель экстрима" } }, { "question": "Какой мастер-класс привлёк бы твоё внимание на выставке «Образование и карьера»? ", "variants": { "akf/mtf" : "управление беспилотным летательным аппаратом", "sf/idst" : "эксплуатация строительных 3D-принтеров", "fpmm/etf/gumf" : "создание и продвижение видеоигр", "htf/gnf" : "выделение ДНК из пищевых продуктов" } }, { "question": "Человеческой цивилизации угрожает скорое исчезновение. Чтобы её спасти, тебе понадобится: ", "variants": { "akf/mtf" : "суперкомпьютер", "sf/idst" : "супер-автомобиль", "fpmm/etf/gumf" : "супер-скрипт", "htf/gnf" : "супер-энергия" } }, { "question": "Ты хорошо учился в школе. Осталось несколько шагов, чтобы сбылась твоя мечта:", "variants": { "akf/mtf" : "запускать космические корабли", "sf/idst" : "строить современные города", "fpmm/etf/gumf" : "обучать людей и роботов", "htf/gnf" : "заниматься экологией и биотехнологиями" } }, { "question": "Какое рабочее место наиболее приглянулось тебе?", "variants": { "akf/mtf" : "испытательный стенд", "sf/idst" : "конструкторское бюро", "fpmm/etf/gumf" : "место у персонального компьютера, работа с нейросетью", "htf/gnf" : "лаборатория" } } ], "appended_question": { "question": "Ты согласился участвовать в эксперименте. И теперь тебе предстоит: ", "variants": { "akf/mtf" : "испытать работу ракетного двигателя на альтернативном топливе", "sf/idst" : "проверить на прочность сооружение из инновационных материалов", "fpmm/etf/gumf" : "протестировать искусственный интеллект на креативность", "htf/gnf" : "создать трёхмерную модель горной породы в виртуальной лаборатории" } }, "groups":[ [ { "question": " Чему посвятишь своё свободное время, когда плохая погода и не хочется выходить из дома?", "variants": { "akf" : "буду делать эскизы летательных аппаратов будущего", "mtf" : "начну собирать механическую руку-манипулятор для робота" } }, { "question": "Какую подработку ты выберешь, если будет такая возможность?", "variants": { "akf" : "создание прототипов деталей ракетных двигателей", "mtf" : "лазерная печать металлических изделий на основе 3D-модели" } }, { "question": "Где ты видишь себя после окончания Политеха?", "variants": { "akf" : "предприятия авиастроения и космической отрасли", "mtf" : "предприятия металлургической отрасли и машиностроения" } } ], [ { "question": "Чему посвятишь своё свободное время, когда плохая погода и не хочется выходить из дома?", "variants": { "sf" : "смастерю макет своего дома мечты", "idst" : "соберу модель легендарной Chevrolet Camaro" } }, { "question": "Какую подработку ты выберешь, если будет такая возможность?", "variants": { "sf" : "цифровое моделирование зданий под заказ", "idst" : "разработка автомобиля на альтернативной энергии" } }, { "question": "Где ты видишь себя после окончания Политеха?", "variants": { "sf" : "предприятия и компании в индустрии строительства", "idst" : "предприятия транспортной отрасли" } } ], [ { "question": "Чему посвятишь своё свободное время, когда плохая погода и не хочется выходить из дома?", "variants": { "htf" : "проведу химические опыты из подручных средств", "gnf" : "составлю каталог своей коллекции минералов" } }, { "question": "Какую подработку ты выберешь, если будет такая возможность?", "variants": { "htf" : "лаборант в лаборатории инновационной фармацевтики", "gnf" : "отправлюсь в исследовательскую экспедицию с геологами" } }, { "question": "Где ты видишь себя после окончания Политеха?", "variants": { "htf" : "компании, выпускающие химическую продукцию", "gnf" : "компании нефтегазовой отрасли" } } ], [ { "question": "Чему посвятишь своё свободное время, когда плохая погода и не хочется выходить из дома? ", "variants": { "etf" : "переустановлю ПО на своём компьютере", "gumf" : "изучу тренды в соцсетях для продвижения своего блога", "fpmm" : "помогу друзьям решить сложные задачки по математике" } }, { "question": "Какую подработку ты выберешь, если будет такая возможность?", "variants": { "etf" : "разработка мобильного приложения", "gumf" : "работа над проектом по развитию городской среды", "fpmm" : "обучение нейросетей" } }, { "question": "Где ты видишь себя после окончания Политеха?", "variants": { "etf" : "IT-компании, предприятия по производству роботов", "gumf" : "консалтинговые фирмы, государственные структуры и бизнесы", "fpmm" : "компании, выпускающие электронику, технологии с оптоволокном и пр." } } ] ] }`);
        this.currentQuestions = this.allQuestions.root;
        this.totalQuestions = this.allQuestions.root.length;
        this.loading = false;
      } catch (error) {
        console.error('Error loading data:', error);
        this.loading = false;
      }
    },
    loadGameProgress() {
      const savedCharacter = Script.getCookie('selectedCharacter');
      if (savedCharacter) {
        this.characterImage = JSON.parse(savedCharacter).image;
      }
      Script.removeCookie('gameProgress');
    },
    saveGameProgress() {},
    animateCharacter() {
      this.characterVisible = true;
      this.characterPosition = -30;
      const targetPosition = 5;
      const speed = 0.5;
      const animate = () => {
        if (this.characterPosition < targetPosition) {
          this.characterPosition += speed;
          requestAnimationFrame(animate);
        }
      };
      animate();
    },
    selectAnswer(answerKey) {
      if (this.isTransitioning) return;
      this.isTransitioning = true;
      this.selectedAnswer = answerKey;
      this.totalAnswered++;
      // Tiebreaker logic
      if (this.gameState === 'tiebreaker') {
        // The answerKey is the group key
        this.dominantBranchGroup = answerKey;
        this.moveToGroupQuestions();
        this.isTransitioning = false;
        this.selectedAnswer = null;
        return;
      }
      // Normal logic
      const branches = answerKey.split('/');
      branches.forEach(branch => {
        this.branchScores[branch] = (this.branchScores[branch] || 0) + 1;
      });
      setTimeout(() => {
        if (this.currentQuestionIndex < this.currentQuestions.length - 1) {
          this.currentQuestionIndex++;
          this.selectedAnswer = null;
        } else {
          if (this.gameState === 'root_questions') {
            // Check for tie after 6 questions
            if (this.currentQuestions.length === 6) {
              const tieGroups = this.getTiedGroups();
              if (tieGroups.length === 2) {
                this.showTiebreaker(tieGroups);
                this.isTransitioning = false;
                return;
              }
            }
            this.moveToGroupQuestions();
          } else if (this.gameState === 'group_questions') {
            this.finishGame();
          }
        }
        this.isTransitioning = false;
      }, 500);
    },
    getTiedGroups() {
      // Map branches to groups
      const groupMapping = {
        'akf': 'akf/mtf', 'mtf': 'akf/mtf',
        'sf': 'sf/idst', 'idst': 'sf/idst',
        'htf': 'htf/gnf', 'gnf': 'htf/gnf',
        'fpmm': 'fpmm/etf/gumf', 'etf': 'fpmm/etf/gumf', 'gumf': 'fpmm/etf/gumf',
      };
      // Count group scores
      const groupScores = {};
      for (const branch in this.branchScores) {
        const group = groupMapping[branch];
        groupScores[group] = (groupScores[group] || 0) + this.branchScores[branch];
      }
      // Find top two groups
      const sorted = Object.entries(groupScores).sort((a, b) => b[1] - a[1]);
      if (sorted.length < 2) return [];
      if (sorted[0][1] === sorted[1][1]) {
        // Tie between two groups
        return [
          { key: sorted[0][0] },
          { key: sorted[1][0] }
        ];
      }
      return [];
    },
    getGroupName(groupKey) {
      const names = {
        'akf/mtf': 'АКФ/МТФ',
        'sf/idst': 'СФ/ИДСТ',
        'fpmm/etf/gumf': 'ФПММ/ЭТФ/GUMF',
        'htf/gnf': 'ХТФ/GNF'
      };
      return names[groupKey] || groupKey;
    },
    showTiebreaker(tieGroups) {
      this.gameState = 'tiebreaker';
      this.tiebreakerGroups = tieGroups;
      this.tiebreakerQuestion = this.allQuestions.appended_question;
      this.currentQuestionIndex = 0;
      this.selectedAnswer = null;
    },
    moveToGroupQuestions() {
      if (!this.dominantBranchGroup) {
        this.determineBranchGroup();
      }
      this.gameState = 'group_questions';
      const groupIndex = this.getGroupIndex(this.dominantBranchGroup);
      if (groupIndex !== -1) {
        this.currentQuestions = this.allQuestions.groups[groupIndex];
        this.totalQuestions += this.currentQuestions.length;
        this.currentQuestionIndex = 0;
        this.selectedAnswer = null;
        this.branchScores = {}; // Reset scores for the final decision
      } else {
        this.finishGame(); // No group questions found
      }
    },
    getGroupIndex(groupKey) {
      const groupKeys = [
        'akf/mtf',
        'sf/idst',
        'htf/gnf',
        'fpmm/etf/gumf'
      ];
      return groupKeys.indexOf(groupKey);
    },
    determineBranchGroup() {
      const groupMapping = {
        'akf': 'akf/mtf', 'mtf': 'akf/mtf',
        'sf': 'sf/idst', 'idst': 'sf/idst',
        'htf': 'htf/gnf', 'gnf': 'htf/gnf',
        'fpmm': 'fpmm/etf/gumf', 'etf': 'fpmm/etf/gumf', 'gumf': 'fpmm/etf/gumf',
      };
      let maxScore = 0;
      let topBranch = '';
      for(const branch in this.branchScores) {
        if(this.branchScores[branch] > maxScore) {
          maxScore = this.branchScores[branch];
          topBranch = branch;
        }
      }
      this.dominantBranchGroup = groupMapping[topBranch];
    },
    finishGame() {
      let maxScore = 0;
      let finalBranch = '';
      for(const branch in this.branchScores) {
        if(this.branchScores[branch] > maxScore) {
          maxScore = this.branchScores[branch];
          finalBranch = branch;
        }
      }
      this.dominantBranch = finalBranch;
      this.gameState = 'done';
      Script.setCookie('gameResult', JSON.stringify({
        branch: this.dominantBranch,
        branchGroup: this.dominantBranchGroup
      }));
      fetch(process.env.VUE_APP_BASE_URL + "/api/v1/test-results", {
        method : "POST",
        headers: {
          'Content-Type' : 'application/json',
          'Connection' : 'keep-alive'
        },
        body: JSON.stringify({
          token: Script.getCookie("token"),
          result: JSON.parse(Script.getCookie("gameResult")).branch
        })
      })
      this.$emit('game-completed', this.totalAnswered);
    }
  }
}
</script>

<style scoped>
.visual-novel {
  width: 100vw;
  height: var(--full-height);
  overflow: hidden;
  position: relative;
  background-color: #00023b;
  display: flex;
  flex-direction: column;
}
.top-section {
  width: 100vw;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  background-size: contain;
  background-position: bottom;
  background-repeat: no-repeat;
  overflow: hidden;
}
.character {
  position: relative;
  bottom: -50px;
  height: 100%;
  width: 50vw;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: bottom;
  opacity: 0;
  transition: opacity 0.5s ease-in-out, right 1s ease-out;
}
.character-enter {
  opacity: 1;
  animation: character-idle 4s ease-in-out infinite;
  animation-delay: 1.5s;
}
@keyframes character-idle {
  0% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
  100% { transform: translateY(0); }
}
.bottom-section {
  width: 100vw;
  min-height: 250px;
  background: black;
  text-align: center;
  flex: 0 0 auto;
}
.question-section {
  display: inline-block;
  padding: 16px;
  color: white;
  margin: 0;
  border-radius: 20px;
  width: 50vw;
  align-self: center;
  z-index: 10;
  position: relative;
}
.question {
  color: #fff;
  font-size: 20px;
  margin-bottom: 20px;
}
.answers {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}
.neon-button {
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
@media (max-width: 900px) {
  .top-section{
    background-size: cover;
  }
  .character {
    bottom: -20px;
    height: 60vh;
    width: 60%;
  }
  .question-section {
    display: block;
    padding: 6px;
    width: 100%;
  }
}
@media (max-width: 480px) {
  .top-section{
    background-size: cover;
  }
  .character {
    bottom: -20px;
    height: 60vh;
    width: 60%;
  }
  .question-section {
    display: block;
    padding: 6px;
    width: 100%;
  }
}
@media (max-width: 600px) {
  .top-section{
    background-size: cover;
  }
  .character {
    bottom: -20px;
    left: -100px;
    height: 60vh;
    width: 100vh;
  }
  .answers {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }
  .question {
    font-size: 16px;
  }
  .dialogue-text {
    font-size: 14px;
  }
  .answer-btn, .neon-button {
    font-size: 13px;
    padding: 10px 16px;
    width: 100%;
  }
  .dialogue-box {
    padding: 10px;
  }
  .question-section {
    display: block;
    padding: 6px;
    width: 100%;
  }
}
</style> 