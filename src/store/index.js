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
    async updateUser({ commit }) {
      return new Promise((resolve, reject) => {
        axios.get('/api/user')
          .then((res) => {
            commit('updateUser', res.data.user);
            resolve();
          })
          .catch((err) => {
            console.log(err);
            if (err.response && err.response.status === 404) {
              reject();
            }
          });
      });
    },
  },
  getters: {
    currProbUrl(state) {
      if (!state.user) return '/stories/0';
      if (!state.user.timer_start) {
        return { name: 'Story', params: { number: state.user.progress } };
      }
      return { name: 'Problem', params: { number: state.user.progress + 1 } };
    },
  },
});
