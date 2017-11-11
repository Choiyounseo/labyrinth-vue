<template>
  <div id="body">
    <div v-if="success">Reset complete!</div>
  </div>
</template>

<script>
  import axios from 'axios';

  export default {
    name: 'Reset',
    data() {
      return {
        success: false,
      };
    },
    mounted() {
      axios.get('/api/users/reset')
        .then(() => {
          this.success = true;
        })
        .catch(() => {
          this.success = false;
        });
    },
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  #body {
    padding-top: 250px
  }
</style>
