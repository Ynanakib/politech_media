<template>
  <div class="character-selection">
    <div class="neon-background">
      <div class="stars"></div>
      <div class="stars2"></div>
      <div class="stars3"></div>
    </div>
    
    <div class="content">
      <h1 class="neon-title">Выбери своего героя для прохождения профмиссии</h1>
      
      <div class="characters-grid">
        <div 
          v-for="character in characters" 
          :key="character.id"
          class="character-card"
          :class="{ 'selected': selectedCharacter?.id === character.id, 'mobile-active': mobileActiveCharacterId === character.id }"
          @click="selectCharacter(character)"
        >
          <div class="character-image">
            <img :src="character.image" :alt="character.name">
          </div>
          <div class="character-name">{{ character.name }}</div>
          <div class="mobile-info" v-if="isMobile && mobileActiveCharacterId !== character.id">{{ character.mobileInfo }}</div>
          <div class="character-info">
            <div class="character-stats">
              <span class="stat">{{ character.class }}</span>
            </div>
            <p class="character-description">{{ character.description }}</p>
          </div>
          <button 
            v-if="(selectedCharacter?.id === character.id) || (mobileActiveCharacterId === character.id && isMobile)"
            @click.stop="onMobileSelect(character)"
            class="select-btn neon-button"
          >
            Выбрать
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as Script from "@/assets/scripts.js"
export default {
  name: 'CharacterSelection',
  data() {
    return {
      selectedCharacter: null,
      mobileActiveCharacterId: null,
      characters: [
        {
          id: 1,
          name: "Даша",
          description: "🌟 Спецфича: держать группу в (страхе) дедлайнах\n🚀 Суперскилл: знает ФИО всех преподавателей\n💣 Слабость: переживает приступ паники при потере журнала посещаемости",
          class: "Староста группы",
          image: require('@/assets/img/characters/dasha.png'),
          mobileInfo: `🎮 Староста группы\n📌 крутая ДАША`
        },
        {
          id: 2,
          name: "Макс",
          description: "🌟 Спецфича: организация крутых ивентов и заряд атмосферы на уровне бога мемов\n🚀 Суперскилл: дружба со всеми в универе гарантирована\n💣 Слабость: частенько пропускает пары ради грандиозных мероприятий",
          class: "Студент-активист",
          image: require('@/assets/img/characters/max.png'),
          mobileInfo: `🎮 Студент-активист\n📌 нереальный МАКС`
        },
        {
          id: 3,
          name: "Вадим Сергеевич",
          description: "🌟 Спецфича: объясняет сложные темы простыми словами\n🚀 Суперскилл: мотивирует стать лучшей версией себя, применяя прогрессивные методы обучения\n💣 Слабость: предпочитает проведение пар оформлению бумаг, замедляя административные процессы",
          class: "Преподаватель",
          image: require('@/assets/img/characters/vadim.png'),
          mobileInfo: `🎮 Преподаватель\n📌 исследователь \nВАДИМ СЕРГЕЕВИЧ`
        },
        {
          id: 4,
          name: "Барсик",
          description: "🌟 Спецфича: расслабляющий мурр-эффект\n🚀 Суперскилл: мгновенно восстанавливает потерянную энергию\n💣 Слабость: комплекс ПНИПУ - ну уж очень любит лазить по деревьям и застревать на них",
          class: "Кот учёный",
          image: require('@/assets/img/characters/cat.png'),
          mobileInfo: `🎮 Кот учёный\n📌 магистр БАРСИК`
        }
      ]
    }
  },
  mounted() {
    // Check if character is already selected
    const savedCharacter = Script.getCookie('selectedCharacter')
    if (savedCharacter) {
      this.selectedCharacter = JSON.parse(savedCharacter)
      this.confirmSelection()
    }
  },
  methods: {
    selectCharacter(character) {
      if (this.isMobile) {
        // On mobile, expand/collapse card
        this.mobileActiveCharacterId = this.mobileActiveCharacterId === character.id ? null : character.id;
      } else {
        this.selectedCharacter = character;
      }
    },
    onMobileSelect(character) {
      this.selectedCharacter = character;
      this.confirmSelection();
    },
    confirmSelection() {
      if (this.selectedCharacter) {
        // Save to Script
        Script.setCookie('selectedCharacter', JSON.stringify(this.selectedCharacter))
        
        // Emit event to parent to switch to game component
        this.$emit('character-selected', this.selectedCharacter)
      }
    }
  },
  computed: {
    isMobile() {
      return window.innerWidth <= 600;
    }
  }
}
</script>

<style scoped>
.character-selection {
  width: 100%;
  height: 100%;
  position: relative;
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
}

.neon-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.stars, .stars2, .stars3 {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
}

.stars {
  background-image: radial-gradient(2px 2px at 20px 30px, #eee, transparent),
                    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
                    radial-gradient(1px 1px at 90px 40px, #fff, transparent),
                    radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
                    radial-gradient(2px 2px at 160px 30px, #ddd, transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: sparkle 8s linear infinite;
}

.stars2 {
  background-image: radial-gradient(2px 2px at 120px 20px, #fff, transparent),
                    radial-gradient(2px 2px at 60px 60px, rgba(255,255,255,0.8), transparent),
                    radial-gradient(1px 1px at 180px 50px, #ddd, transparent),
                    radial-gradient(1px 1px at 100px 90px, rgba(255,255,255,0.6), transparent);
  background-repeat: repeat;
  background-size: 300px 150px;
  animation: sparkle 12s linear infinite;
}

.stars3 {
  background-image: radial-gradient(1px 1px at 50px 10px, #fff, transparent),
                    radial-gradient(1px 1px at 150px 40px, rgba(255,255,255,0.8), transparent),
                    radial-gradient(1px 1px at 80px 80px, #ddd, transparent);
  background-repeat: repeat;
  background-size: 400px 200px;
  animation: sparkle 16s linear infinite;
}

@keyframes sparkle {
  0% { transform: translateY(0px); }
  100% { transform: translateY(-200px); }
}

.content {
  position: relative;
  z-index: 10;
  padding: 40px 20px;
  max-width: 1400px;
  margin: 0 auto;
  height: var(--full-height);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.neon-title {
  font-size: 4rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
  color: #fff;
  text-shadow: 
    0 0 5px #0ff,
    0 0 10px #0ff,
    0 0 15px #0ff,
    0 0 20px #0ff;
  animation: neon-pulse 2s ease-in-out infinite alternate;
}

.neon-subtitle {
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 60px;
  color: #0ff;
  text-shadow: 0 0 10px #0ff;
}

@keyframes neon-pulse {
  from { text-shadow: 0 0 5px #0ff, 0 0 10px #0ff, 0 0 15px #0ff, 0 0 20px #0ff; }
  to { text-shadow: 0 0 2px #0ff, 0 0 5px #0ff, 0 0 8px #0ff, 0 0 12px #0ff; }
}

.characters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  padding: 20px;
  min-height: 700px;
}

.character-card {
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #0ff;
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.character-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.character-card:hover::before {
  left: 100%;
}

.character-card:hover {
  transform: translateY(-10px);
  box-shadow: 
    0 0 20px #0ff,
    0 0 40px #0ff,
    0 0 60px #0ff;
}

.character-card.selected {
  border-color: #f0f;
  box-shadow: 
    0 0 20px #f0f,
    0 0 40px #f0f,
    0 0 60px #f0f;
}

.character-image {
  text-align: center;
  margin-bottom: 20px;
}

.character-image img {
  width: 150px;
  height: 200px;
  object-fit: cover;
  border-bottom: 2px solid #0ff;
}

.character-name {
  font-size: 1.9rem;
  color: #fff;
  margin-bottom: 10px;
  text-shadow: 0 0 10px #0ff;
}

.character-description {
  margin-bottom: 15px;
  font-size: 0.95rem;
  color: #ccc;
  line-height: 1.5;
  white-space: pre-line;
  text-align: left;
}

.character-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.stat {
  color: #0ff;
  font-weight: bold;
  text-shadow: 0 0 5px #0ff;
}

.select-btn {
  margin-top: auto;
  width: 100%;
  padding: 15px;
  background: linear-gradient(45deg, #f0f, #0ff);
  border: none;
  border-radius: 25px;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.select-btn:hover {
  transform: scale(1.05);
  box-shadow: 
    0 0 20px #f0f,
    0 0 40px #f0f;
}

.mobile-info{
  display: none;
}

/* Responsive design */
@media (max-width: 768px) {
  .neon-title {
    font-size: 2.5rem;
  }
  
  .neon-subtitle {
    font-size: 1.2rem;
  }
  
  .characters-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 10px;
  }
  
  .character-card {
    padding: 15px;
  }
  
  .character-image {
    width: 170px;
    height: 160px;
  }
}

@media (max-width: 480px) {
  .neon-title {
    font-size: 2rem;
    padding-top: 10px;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
  }
  
  .content {
    padding: 0;
  }
}

@media (max-width: 600px) {
  .neon-title{
    font-size: 1.6rem;
  }
  .characters-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    min-height: unset;
    height: var(--full-height);
    overflow-y: auto;
    height: fit-content;
  }
  .character-card:nth-child(1){
    margin-top: 85px;
  }
  .character-card {
    min-height: 120px;
    max-height: 120px;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    align-items: center;
    transition: max-height 0.3s, min-height 0.3s;
    cursor: pointer;
    position: relative;
  }
  .character-card .character-image {
    width: 80px;
    height: 90px;
    flex-shrink: 0;
    margin: 10px 0 10px 16px;
  }
  .character-card .character-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 10px;
  }
  .character-card .character-name,
  .character-card .character-info,
  .character-card .select-btn {
    display: none;
  }
  .mobile-info{
    display: block;
  }
  .character-card.mobile-active .character-name{
    margin-top: 8px;
    font-size: 1.3rem;
    display: block;
    color: #fff;
    text-shadow: 0 0 5px #0ff;
    font-weight: 500;
    width: 100%;
    text-align: center;
  }
  .character-card.mobile-active {
    min-height: 480px;
    flex-direction: column;
    align-items: flex-start;
    background: rgba(0,0,0,0.98);
    z-index: 10;
    box-shadow: 0 4px 18px #0ff;
  }
  .character-card.mobile-active .character-info,
  .character-card.mobile-active .select-btn {
    display: block;
    width: 100%;
  }
  .character-card.mobile-active .character-info {
    margin-top: 10px;
    text-align: left;
  }
  .character-card.mobile-active .character-image {
    margin: 0 auto;
    width: 130px;
    height: 160px;
  }
  .character-card.mobile-active .character-description {
    font-size: 0.8rem;
    text-align: left;
  }
  .character-card.mobile-active .character-stats {
    font-size: 0.8rem;
    text-align: left;
  }
  .character-card.mobile-active .select-btn {
    font-size: 0.9rem;
    padding: 10px;
  }
  .character-card .mobile-info {
    font-size: 0.8rem;
    color: #bff;
    white-space: pre-line;
    margin-left: 8px;
    margin-top: 2px;
    margin-bottom: 2px;
    line-height: 1.3;
    text-align: left;
  }
}
</style> 