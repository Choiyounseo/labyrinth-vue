import Vue from 'vue';
import Router from 'vue-router';
import Login from '@/components/Login';
import Main from '@/components/Main';
import Problem from '@/components/Problem';
import Story from '@/components/Story';
import Ending from '@/components/Ending';
import NotAllowed from '@/components/NotAllowed';
import Reset from '@/components/Reset';
import AdminProblem from '@/components/AdminProblem';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
    {
      path: '/main',
      name: 'Main',
      component: Main,
    },
    {
      path: '/problems/:number',
      name: 'Problem',
      component: Problem,
    },
    {
      path: '/stories/:number',
      name: 'Story',
      component: Story,
    },
    {
      path: '/ending',
      name: 'Ending',
      component: Ending,
    },
    {
      path: '/not_allowed',
      name: 'NotAllowed',
      component: NotAllowed,
    },
    {
      path: '/admin/problem',
      name: 'AdminProblem',
      component: AdminProblem,
    },
    {
      path: '/reset',
      name: 'Reset',
      component: Reset,
    },
  ],
});
