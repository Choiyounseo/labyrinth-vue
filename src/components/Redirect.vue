<template>
</template>

<script>
  import { mapState, mapActions } from 'vuex';

  export default {
    name: 'Redirect',
    computed: {
      ...mapState([
        'user',
      ]),
    },
    methods: {
      ...mapActions([
        'updateUser',
      ]),
    },
    async beforeMount() {
      if (this.$route.fullPath !== '/login') {
        const data = await this.updateUser();
        if (data.notLoggedIn) {
          alert('You are not logged in!');
          this.$router.replace('/login');
        }
      }
    },
  };

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
