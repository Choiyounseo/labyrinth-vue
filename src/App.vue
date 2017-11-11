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
    color: #ffffff;
    background-color: #000000;
    padding-top: 50px;
    height: 100%;
    padding-bottom: 100px;
    position: relative;
  }

  #footer {
    position: absolute;
    bottom: 0;
    width: 100vw;
  }

  a:link, :visited {
    color: #ff0000;
  }
</style>
