<template>
  <div>
    <div>
      <p class="right_align_wrapper">
        <router-link to="/main">go to main</router-link>
      </p>
      <div class="right_align_wrapper">
        <span id="timer" style="float: right">00:00:00</span>
      </div>
      <br />
      <img src="imgSrc" width="800"/>
      <br />
      <p>힌트</p>
      <div id="hints">
        <p v-for="hint in hints">{{ hint }}</p>
      </div>
      <input v-model="answer" type="text" />
      <button @click="submitAnswer" type="button">제출</button>
      <p id="wrong_answer" v-if="isWrong">
        wrong answer...
      </p>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';

  export default {
    name: 'Problem',
    data() {
      return {
        problem: null,
        hints: [],
        answer: '',
        isWrong: false,
      };
    },
    computed: {
      imgSrc() {
        return `/static/problems/${this.problem.imgName}`;
      },
    },
    methods: {
      submitAnswer() {
        axios.post(`/api/problems/${this.$route.params.number}/answer`, {
          answer: this.answer,
        })
          .then((res) => {
            if (res.data.correct) {
              this.$router.push({ name: 'Story', params: { number: this.$route.params.number } });
            } else {
              this.isWrong = true;
            }
          })
          .catch(() => {
            this.isWrong = true;
          });
      },
    },
    mounted() {
      axios.get(`/api/problems/${this.$route.params.number}`)
        .then((res) => {
          this.problem = res.data;
        })
        .catch(() => {
          this.$router.push('/not_allowed');
        });
    },
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  #wrong_answer {
    color: #ff0000;
  }

  .right_align_wrapper {
    text-align: right;
  }
</style>
