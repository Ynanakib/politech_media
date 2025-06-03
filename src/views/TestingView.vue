<template>
  <main>
    <div class="bottom">
      <p class="question">{{ this.questions[currentQuestion].question }}</p>
      <div class="controls">
        <button v-if="0 < sequence.length" @click="this.answer(sequence[0])">
          {{ this.questions[currentQuestion].variants[sequence[0]] }}
        </button>
        <button v-if="1 < sequence.length" @click="this.answer(sequence[1])">
          {{ this.questions[currentQuestion].variants[sequence[1]] }}
        </button>
        <button v-if="2 < sequence.length" @click="this.answer(sequence[2])">
          {{ this.questions[currentQuestion].variants[sequence[2]] }}
        </button>
        <button v-if="3 < sequence.length" @click="this.answer(sequence[3])">
          {{ this.questions[currentQuestion].variants[sequence[3]] }}
        </button>
      </div>
    </div>
  </main>
</template>

<script>
export default {
  name: "TestingView",
  components: {},
  data() {
    return {
      groups: { "akf/mtf": 0, "sf/idst": 0, "fpmm/etf/gumf": 0, "htf/gnf": 0 },
      extended: {},
      facultets: -1,
      currentQuestion: 0,
      sequence: ["akf/mtf", "sf/idst", "fpmm/etf/gumf", "htf/gnf"],
      questions: [{ question: "", variants: ["", ""] }],
      allQuestions: [],
      result: "",
      linker: { "akf/mtf": 0, "sf/idst": 1, "htf/gnf": 2, "fpmm/etf/gumf": 3 },
    };
  },
  methods: {
    maxDuplicate(array = {}) {
      let keys = Object.keys(array);
      let max = 0;
      for (let k in keys) {
        if (array[keys[max]] < array[keys[k]]) {
          max = k;
        }
      }
      for (let k in keys) {
        if ((array[keys[max]] == array[keys[k]]) & (max != k)) {
          return [keys[max], keys[k]];
        }
      }
      return false;
    },
    maxOf(array = {}) {
      let keys = Object.keys(array);
      let max = 0;
      for (let k in keys) {
        if (array[keys[max]] < array[keys[k]]) {
          max = k;
        }
      }
      return keys[max];
    },
    minOf(array = {}) {
      let keys = Object.keys(array);
      let min = 0;
      for (let k in keys) {
        if (array[keys[min]] > array[keys[k]]) {
          min = k;
        }
      }
      return keys[min];
    },
    answer(variant) {
      if (this.facultets == -1) {
        this.groups[variant]++;
        if (this.currentQuestion < 5) {
          this.currentQuestion++;
        } else if (this.currentQuestion == 5) {
          let m = this.maxDuplicate(this.groups);

          if (m != false) {
            this.currentQuestion = 6;
            this.sequence = m;
          } else {
            this.facultets = this.maxOf(this.groups);
            this.questions =
              this.allQuestions.groups[this.linker[this.facultets]];
            this.sequence = Object.keys(this.questions[0].variants);
            for (let s in this.sequence) {
              this.extended[this.sequence[s]] = 0;
            }
            this.currentQuestion = 0;
          }
        } else if (this.currentQuestion == 6) {
          this.facultets = this.maxOf(this.groups);
          this.questions =
            this.allQuestions.groups[this.linker[this.facultets]];
          this.sequence = Object.keys(this.questions[0].variants);
          for (let s in this.sequence) {
            this.extended[this.sequence[s]] = 0;
          }
          this.currentQuestion = 0;
        }
      } else {
        this.extended[variant]++;
        if (this.currentQuestion < 2) {
          this.currentQuestion++;
        } else if (this.currentQuestion == 2) {
          localStorage.setItem("result", this.maxOf(this.extended));
          this.$router.push("result");
        }
      }
    },
  },
  beforeCreate() {
    fetch("https://winfrid.p-host.in/api/questions.json") //ну так на сайте
    // fetch("http://127.0.0.1:5500/public/questions.json") //здесь надо указать пусть к файлу с вопросами public/questions.json
      .then((doc) => {
        return doc.json();
      })
      .then((text) => {
        this.allQuestions = text;
        this.questions = text.root;
      })
      .catch(console.warn);
  },
};
</script>

<style scoped>
main {
  display: flex;
  flex-direction: column-reverse;
  height: 100vh;
}
.bottom {
  display: inline;
  padding: 2%px 10%px;
}
.controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
button {
  display: block;
  margin: 2% 5%;
  min-height: 50px;
  padding: 2%;
  border: 1px solid #5d5d5d;
  background-color: #cecece;
  border-radius: 8px;
  
}
</style>
