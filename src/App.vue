<template>
  <div id="app">
    <router-view/>
    <foot id="footer"></foot>
  </div>
</template>

<script>
  import Foot from './components/Foot';

  export default {
    name: 'app',
    components: {
      Foot,
    },
  };
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
