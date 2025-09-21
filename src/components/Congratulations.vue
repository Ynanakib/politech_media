<template>
  <div class="congratulations">
    <div class="neon-background">
      <div class="stars"></div>
      <div class="stars2"></div>
      <div class="stars3"></div>
    </div>
    
    <div class="content">
      <div class="congratulations-card">

        <div class="result-showcase" v-if="gameResult">
          <p class="result-description">Для вас лучше всего подойдет</p>
          <b class="result-description"> {{ facultate }}</b>
        </div>
        <div id="video">
          <img src="@/assets/img/loading.gif" class="loader">
        </div>
        <div class="buttons">
          <button @click="playAgain" class="neon-button primary">
            Пройти тест еще раз
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as Script from '@/assets/Script.js'
export default {
  name: 'CongratulationsScreen',
  props: {
    totalQuestions: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      selectedCharacter: null,
      video: null
    }
  },
  computed:{
    facultate(){
      return this.getFacultate(this.gameResult.finalFaculty)
    },
    gameResult(){
      return JSON.parse(Script.LocalStorage.get('gameResult'))
    }
  },
  mounted(){
    fetch(process.env.VUE_APP_BASE_URL + "/api/v1/media/videos")
    .then(el => {
      console.log(el)
      return el;
    })
    .then( result => result.json())
    .then( ( array = [] ) => {
        let res = this.gameResult.branch
        for (let i = 0; i < array.length; i++) {
            const el = array[i];
            if(el.title == res) return el
        }
    })
    .then(el => {
        let data = el.url.split("/")[3].split("_")
        let oid = data[0].substr(5)
        let id = data[1]
        return [oid, id]
    })
    .then((arr)=>{
        const container = document.getElementById('video');
        container.style.setProperty("height", container.clientWidth)
        let oid = arr[0]
        let id = arr[1]
        let inFrame = document.createElement("iframe")
        
        let width = container.clientWidth;
        let height = container.clientWidth*0.5625;

        inFrame.setAttribute("src", "https://vkvideo.ru/video_ext.php?oid=" + oid + "&id=" + id + "&hd=2&autoplay=1")
        inFrame.setAttribute("width", width)
        inFrame.setAttribute("height", height)
        inFrame.setAttribute("allow", "autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;")
        inFrame.setAttribute("frameborder", "0")
        inFrame.setAttribute("allowfullscreen", "")
        container.innerHTML = "";
        container.appendChild(inFrame);
    })
  },
  methods: {
    playAgain() {
      Script.LocalStorage.remove('selectedCharacter')
      Script.LocalStorage.remove('gameProgress')
      Script.LocalStorage.remove('gameResult');
      this.$emit('change-character')
    },
    getFacultate(result){
      let facultates = {
                "etf": " электротехнический факультет",
                "fpmm": " факультет прикладной математики и механики",
                "gumf": " гуманитарный факультет",
                "akf": " аэрокосмический факультет",
                "mtf": " механико-технологический факультет",
                "sf": " строительный факультет",
                "idst": " институт доржного строительства и транспорта",
                "htf": " факультет химических технологий, промышленной экологии и биотехнологий",
                "gnf": " горно-нефтяной факультет",
            }
      return facultates[result]
    }
  }
}
</script>

<style scoped>
#video{
  display: block;
  width: 100%;
  margin-top: 30px;
  margin-bottom: 30px;
}

#video img{
  width: 100px;
  height: 100px;
}

.congratulations {
  width: 100%;
  height: 100%;
  overflow: hidden;
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

@keyframes fireworks {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
}

.content {
  position: relative;
  z-index: 10;
  padding: 40px 20px;
  height: var(--full-height);
  display: flex;
  align-items: center;
  justify-content: center;
}

.congratulations-card {
  background: rgba(0, 0, 0, 0.9);
  border: 3px solid #f0f;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  max-width: 600px;
  width: 100%;
  box-shadow: 
    0 0 30px #f0f,
    0 0 60px #f0f,
    0 0 90px #f0f;
  animation: card-glow 2s ease-in-out infinite alternate;
}

@keyframes card-glow {
  from { box-shadow: 0 0 30px #f0f, 0 0 60px #f0f, 0 0 90px #f0f; }
  to { box-shadow: 0 0 20px #f0f, 0 0 40px #f0f, 0 0 60px #f0f; }
}

.neon-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 30px;
  color: #fff;
  text-shadow: 
    0 0 10px #f0f,
    0 0 20px #f0f,
    0 0 30px #f0f,
    0 0 40px #f0f;
  animation: title-pulse 1.5s ease-in-out infinite alternate;
}

@keyframes title-pulse {
  from { text-shadow: 0 0 10px #f0f, 0 0 20px #f0f, 0 0 30px #f0f, 0 0 40px #f0f; }
  to { text-shadow: 0 0 5px #f0f, 0 0 10px #f0f, 0 0 15px #f0f, 0 0 20px #f0f; }
}

.character-showcase {
  margin-bottom: 30px;
}

.character-portrait {
  width: 120px;
  height: 160px;
  object-fit: cover;
  border-radius: 15px;
  border: 3px solid #0ff;
  box-shadow: 0 0 20px #0ff;
  margin-bottom: 15px;
}

.character-name {
  font-size: 2rem;
  color: #fff;
  margin-bottom: 5px;
  text-shadow: 0 0 10px #0ff;
}

.character-class {
  font-size: 1.2rem;
  color: #0ff;
  text-shadow: 0 0 5px #0ff;
}

.achievement-text {
  margin-bottom: 30px;
}

.result-showcase {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 30px;
    border: 1px solid #0ff;
}

.result-title {
    font-size: 1.8rem;
    color: #0ff;
    margin-bottom: 10px;
    text-shadow: 0 0 10px #0ff;
}

.result-description {
    font-size: 1.1rem;
    color: #fff;
}

.main-text {
  font-size: 1.5rem;
  color: #fff;
  margin-bottom: 10px;
  text-shadow: 0 0 10px #0ff;
}

.sub-text {
  font-size: 1.1rem;
  color: #ccc;
  line-height: 1.5;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 40px;
  padding: 20px;
  background: rgba(0, 255, 255, 0.1);
  border-radius: 15px;
  border: 1px solid #0ff;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #0ff;
  text-shadow: 0 0 10px #0ff;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #ccc;
}

.buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.neon-button {
  padding: 15px 30px;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.neon-button.primary {
  background: linear-gradient(45deg, #f0f, #0ff);
  color: white;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 20px #f0f;
}

.neon-button.primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 30px #f0f, 0 0 50px #f0f;
}

.neon-button.secondary {
  background: transparent;
  color: #0ff;
  border: 2px solid #0ff;
  text-shadow: 0 0 10px #0ff;
  box-shadow: 0 0 20px #0ff;
}

.neon-button.secondary:hover {
  background: rgba(0, 255, 255, 0.1);
  transform: translateY(-3px);
  box-shadow: 0 0 30px #0ff, 0 0 50px #0ff;
}

/* Responsive design */
@media (max-width: 768px) {
  .neon-title {
    font-size: 2rem;
  }
  
  .congratulations-card {
    padding: 10px 5px;
    margin: 20px;
  }
  
  .stats {
    flex-direction: column;
    gap: 15px;
  }
  
  .buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .neon-button {
    width: 100%;
    max-width: 250px;
  }
}

@media (max-width: 480px) {
  
  .neon-button {
    width: 100%;
    max-width: 250px;
    font-size: 0.8rem;
  }
  .result-showcase{
    margin: 20px;
  }
  .congratulations-card{
    box-shadow: 
      0 0 10px #f0f,
      0 0 15px #f0f,
      0 0 30px #f0f;
    height: calc(var(--full-height) - 40px);
  }
  @keyframes card-glow {
    from { box-shadow: 0 0 10px #f0f, 0 0 15px #f0f, 0 0 30px #f0f; }
    to { box-shadow: 0 0 15px #f0f, 0 0 20px #f0f, 0 0 35px #f0f; }
  }
  .content{
    padding: 0;
  }
  .neon-title {
    font-size: 1.5rem;
  }
  
  .character-portrait {
    width: 100px;
    height: 130px;
  }
  
  .main-text {
    font-size: 1.2rem;
  }
}
</style> 