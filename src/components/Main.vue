<template>
  <div>
    <img src="/static/start.png" width="800"/>
    <p>
      <!--TODO: route to the current problem according to the user session-->
      <router-link :to="currProbUrl">현재 문제로 가기</router-link>
    </p>
    <br />
    <br />
    <span>
      이전 문제 목록
    </span>
    <div>
      <router-link class="history_item" v-for="i in problemHistory" :to="{ name: 'Problem', params: { number: i }}">{{ i }}</router-link>
    </div>
    <br />
    <span>
      이전 스토리 목록
    </span>
    <div id="past_story_list">
      <router-link class="history_item" v-for="i in storyHistory" :to="{ name: 'Story', params: { number: i }}">{{ i }}</router-link>
    </div>
  </div>
</template>

<script>
  import { mapState, mapActions, mapGetters } from 'vuex';

  export default {
    name: 'Main',
    data() {
      return {
        problems: [],
        stories: [],
      };
    },
    computed: {
      ...mapState([
        'user',
      ]),
      ...mapGetters([
        'currProbUrl',
      ]),
      problemHistory() {
        if (!this.user) {
          return [];
        }
        return Array(this.user.progress).fill().map((x, i) => i + 1);
      },
      storyHistory() {
        if (!this.user) {
          return [];
        }
        return Array(this.user.progress + 1).fill().map((x, i) => i);
      },
    },
    methods: {
      ...mapActions([
        'updateUser',
      ]),
    },
    mounted() {
      this.updateUser();
    },
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
