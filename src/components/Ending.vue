<template>
  <div>
    <img src="/static/end.png" width="900"/>
    <router-link to="/main">go to main</router-link>
  </div>
</template>

<script>
  import axios from 'axios';

  export default {
    name: 'Ending',
    async beforeMount() {
      axios.get('/api/finished')
        .then((res) => {
          if (!res.data.finished) {
            this.$router.replace('/not_allowed');
          }
        });
    },
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
