<template>
  <main>
    <CharacterSelection 
      v-if="currentView === 'character-selection'"
      @character-selected="onCharacterSelected"
    />
    <VisualNovel 
      v-else-if="currentView === 'game'"
      @game-completed="onGameCompleted"
    />
    <CongratulationsScreen 
      v-else-if="currentView === 'congratulations'"
      :total-questions="totalQuestions"
      @play-again="onPlayAgain"
      @change-character="onChangeCharacter"
    />
  </main>
</template>

<script>
import CharacterSelection from '@/components/CharacterSelection.vue'
import VisualNovel from '@/components/VisualNovel.vue'
import CongratulationsScreen from '@/components/Congratulations.vue'
import * as Script from "@/assets/scripts.js"

export default {
  name: 'App',
  components: {
    CharacterSelection,
    VisualNovel,
    CongratulationsScreen
  },
  data() {
    return {
      currentView: 'character-selection',
      selectedCharacter: null,
      totalQuestions: 0
    }
  },
  mounted() {
    if(
      Script.LocalStorage.get("token") == undefined || 
      Script.LocalStorage.get("token") == null || 
      Script.LocalStorage.get("vk_tokens") == null || 
      Script.LocalStorage.get("vk_tokens") == undefined
    )
      this.$router.push("/");
    window.scrollTo(0, 1);
    this.checkInitialView()
  },
  methods: {
    checkInitialView() {
      const savedCharacter = Script.LocalStorage.get('selectedCharacter')
      const savedProgress = Script.LocalStorage.get('gameProgress')
      
      if (savedCharacter && savedProgress) {
        const progress = JSON.parse(savedProgress)
        if (progress.currentScene >= 6) {
          this.currentView = 'congratulations'
          this.totalQuestions = progress.answeredQuestions || 7
        } else {
          this.currentView = 'game'
        }
      } else if (savedCharacter) {
        this.currentView = 'game'
        this.selectedCharacter = JSON.parse(savedCharacter)
      } else {
        this.currentView = 'character-selection'
      }
    },
    
    onCharacterSelected(character) {
      this.selectedCharacter = character
      this.currentView = 'game'
    },
    
    onGameCompleted(answeredQuestions) {
      this.totalQuestions = answeredQuestions
      Script.LocalStorage.set('gameProgress', JSON.stringify({
        answeredQuestions: answeredQuestions
      }))
      this.currentView = 'congratulations'
    },
    
    onPlayAgain() {
      // Clear game progress but keep character
      Script.LocalStorage.remove('gameProgress')
      Script.LocalStorage.remove('gameResult')
      this.currentView = 'game'
    },
    
    onChangeCharacter() {
      Script.LocalStorage.remove('selectedCharacter')
      Script.LocalStorage.remove('gameProgress')
      Script.LocalStorage.remove('gameResult')
      this.selectedCharacter = null
      this.currentView = 'character-selection'
    }
  }
}
</script>

<style>
main{
  height: 100%;
  width: 100%;
}

/* Global neon text styles */
.neon-text {
  text-shadow: 
    0 0 5px #0ff,
    0 0 10px #0ff,
    0 0 15px #0ff;
}

.neon-text-pink {
  text-shadow: 
    0 0 5px #f0f,
    0 0 10px #f0f,
    0 0 15px #f0f;
}

/* Global animations */
@keyframes neon-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

@keyframes neon-glow {
  0%, 100% { 
    box-shadow: 
      0 0 20px #0ff,
      0 0 40px #0ff;
  }
  50% { 
    box-shadow: 
      0 0 30px #0ff,
      0 0 60px #0ff,
      0 0 80px #0ff;
  }
}
</style>
