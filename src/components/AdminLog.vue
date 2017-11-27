<template>
  <div>
    <h1>Hello, labyrinth!</h1>
    <h2>반별 진행 현황</h2>
    <table id="log_table">
      <th></th>
      <th v-for="problem in problems" :key="problem.number">
        Problem {{ problem.number }}
      </th>
      <tr v-for="i in oneToN(classNum)">
        <td>class {{i + 1}}</td>
        <td v-for="j in oneToN(problems.length)">
          {{ getTime('log_start', i + 1, j + 1) }}<br>{{ getTime('log_end', i + 1, j + 1) }}
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
  import axios from 'axios';
  import { mapState, mapActions } from 'vuex';

  export default {
    name: 'Main',
    data() {
      return {
        problems: [],
        logs: [],
        classNum: 26,
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
      oneToN(n) {
        return [...Array(n).keys()];
      },
      getTime(logType, classNum, ProblemNum) {
        if (this.logs.length === 0) return '--:--:--';
        const log = this.logs[classNum - 1][logType];
        return log[ProblemNum - 1] ? this.timerFormat(log[ProblemNum - 1]) : '--:--:--';
      },
      timerFormat(date) {
        date = new Date(date);
        return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
      },
      updateLogs() {
        axios.get('/api/admin/logs')
          .then((res) => {
            this.logs = res.data;
            this.logs.sort((log1, log2) => {
              if (Number(log1.id) < Number(log2.id)) return -1;
              return 1;
            });
          })
          .catch((err) => {
            console.log(err);
          });
      },
    },
    async mounted() {
      await this.updateUser();
      if (this.user.id !== 'admin') {
        this.$router.replace('/not_allowed');
      }
      axios.get('/api/admin/problems')
        .then((res) => {
          this.problems = res.data;
        })
        .catch((err) => {
          console.log(err);
        });
      this.updateLogs();
      setInterval(this.updateLogs, 1000);
    },
  };

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
