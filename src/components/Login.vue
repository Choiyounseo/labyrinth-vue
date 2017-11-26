<template>
  <div id="body">
    <h1>Hello, Labyrinth!</h1>
    <div id="login_input_div" style="visibility: visible">
      <input v-model="id" type="text" name="id" />
      <input v-model="pw" type="password" name="password" />
      <button @click="verifyUser" type="button">Login</button>
      <div v-if="loginFail">
        <span id="login_failed" style="color: #ff0000; visibility: hidden">Login failed... Please try again</span>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';
  import { mapState, mapActions } from 'vuex';

  export default {
    name: 'Login',
    data() {
      return {
        id: '',
        pw: '',
        loginFail: false,
      };
    },
    computed: {
      ...mapState([
        'user',
      ]),
    },
    methods: {
      ...mapActions([
        'updateUser',
      ]),
      verifyUser() {
        axios.post('/api/login', {
          id: this.id,
          password: this.pw,
        })
          .then(() => {
            this.updateUser();
            this.$router.push('/main');
          })
          .catch(() => {
            this.loginFail = true;
          });
      },
    },
    mounted() {
      if (this.user) {
        this.$router.push('/main');
      }
    },
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  #body {
    padding-top: 250px
  }
</style>
