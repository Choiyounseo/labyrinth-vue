<template>
  <div>
    <div>
      <p class="right_align_wrapper">
        <router-link to="/main">go to main</router-link>
      </p>
      <img :src="imgSrc" width="800"/>
      <br />
      <br />
      <br />
      <router-link :to="{ name: 'Problem', params: { number: Number($route.params.number) + 1 } }">다음으로</router-link>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';
  import { mapActions } from 'vuex';

  export default {
    name: 'Story',
    data() {
      return {
        story: null,
      };
    },
    computed: {
      imgSrc() {
        return `/static/stories/${this.story.imgName}`;
      },
    },
    methods: {
      ...mapActions([
        'updateUser',
      ]),
    },
    mounted() {
      this.updateUser();
      axios.get(`/api/stories/${this.$route.params.number}`)
        .then((res) => {
          this.story = res.data.story;
        })
        .catch(() => {
          this.$router.push('/not_allowed');
        });
    },
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .right_align_wrapper {
    text-align: right;
  }
</style>
