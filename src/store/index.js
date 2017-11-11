import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: undefined,
  },
  mutations: {
    updateUser(state, user) {
      state.user = user;
    },
  },
  actions: {
    updateUser({ commit }) {
      axios.get('/api/user')
        .then((res) => {
          commit('updateUser', res.data.user);
          return null;
        })
        .catch(err => err);
    },
  },
});
