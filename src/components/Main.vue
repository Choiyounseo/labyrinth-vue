<template>
  <div>
    <img src="/static/start.png" width="800"/>
    <p>
      <!--TODO: route to the current problem according to the user session-->
      <router-link :to="{ name: 'Problem', params: { number: 1 } }">현재 문제로 가기</router-link>
    </p>
    <br />
    <br />
    <span>
      이전 문제 목록
    </span>
    <div id="past_problem_list">
      <span v-for="problem in problems">
        <router-link :to="{ name: 'Problem', params: { number: problem.number }}"></router-link>
      </span>
    </div>
    <br />
    <span>
      이전 스토리 목록
    </span>
    <div id="past_story_list">
      <span v-for="story in stories">
        <router-link :to="{ name: 'Story', params: { number: story.number }}"></router-link>
      </span>
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex';

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
    },
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
