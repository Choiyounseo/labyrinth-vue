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
      <img :src="imgSrc" width="800"/>
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
  import { mapState, mapActions } from 'vuex';

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
        if (!this.problem) {
          return '/';
        }
        return `/static/problemImages/${this.problem.imageName}`;
      },
      ...mapState([
        'user',
      ]),
    },
    methods: {
      ...mapActions([
        'updateUser',
      ]),
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
    async mounted() {
      await this.updateUser();
      if (this.user.progress + 1 < this.$route.params.number) {
        this.$router.replace('/not_allowed');
      }
      axios.get(`/api/problems/${this.$route.params.number}`)
        .then((res) => {
          if (res.data.finished) {
            this.$router.replace('/ending');
          }
          this.problem = res.data.problem;
        })
        .catch(() => {
          this.$router.replace('/not_allowed');
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
