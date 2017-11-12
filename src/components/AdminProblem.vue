<template>
  <div>
    <h1>Hello, labyrinth!</h1>
    <h2>새 문제 만들기</h2>
    <div>
      <label for="title_input">제목</label>
      <input type="text" id="title_input" name="title" v-model="title" />
    </div>
    <div>
      <label for="number_input">번호</label>
      <input type="number" id="number_input" name="number" v-model="number" />
    </div>
    <div>
      <label for="image_input">사진 파일</label>
      <input type="file" ref="image_input" id="image_input" name="image" @change="onFileChange($event)" />
    </div>
    <div>
      <label for="answer_input">답</label>
      <input type="text" id="answer_input" name="answer" v-model="answer" />
    </div>
    <div>
      <label for="hint1_input">첫 번째 힌트</label>
      <input type="text" id="hint1_input" name="hint1" v-model="hint1" />
    </div>
    <div>
      <label for="hint2_input">두 번째 힌트</label>
      <input type="text" id="hint2_input" name="hint2" v-model="hint2" />
    </div>
    <div>
      <label for="hint3_input">세 번째 힌트</label>
      <input type="text" id="hint3_input" name="hint3" v-model="hint3" />
    </div>
    <button id="new_problem_btn" @click="createProblem()">문제 만들기</button>
    <hr />
    <div id="problem_list" v-for="problem in problems">
      <div>
        <span>문제 이름 : {{ problem.title }}</span>
        <button @click="deleteProblem(problem.title)" style="float: right">삭제</button>
      </div>
      <p>문제 번호 : {{ problem.number }}</p>
      <p>문제 사진 :</p>
      <img :src="'/static/problemImages/' + problem.imageName" width="600"/>
      <p>문제 답 : {{ problem.answer }}</p>
      <p>문제 힌트1 : {{ problem.hint[0] }}</p>
      <p>문제 힌트2 : {{ problem.hint[1] }}</p>
      <p>문제 힌트3 : {{ problem.hint[2] }}</p>
      <hr />
    </div>
  </div>
</template>

<script>
  import axios from 'axios';

  export default {
    name: 'Main',
    data() {
      return {
        problems: [],
        title: '',
        number: '',
        file: '',
        answer: '',
        hint1: '',
        hint2: '',
        hint3: '',
      };
    },
    methods: {
      onFileChange(e) {
        this.file = e.target.files[0];
        console.log(this.file);
      },
      createProblem() {
        const fd = new FormData();
        fd.append(this.file.name, this.file);
        axios.post('/api/admin/problems/detail', {
          title: this.title,
          number: Number(this.number),
          imageName: this.file.name,
          answer: this.answer,
          hint1: this.hint1,
          hint2: this.hint2,
          hint3: this.hint3,
        })
          .then((res1) => {
            console.log('first success', res1);
            axios.post('/api/admin/problems/image', fd)
              .then((res2) => {
                console.log('second success', res2);
                this.problems = res2.data;
                this.title = '';
                this.number = '';
                this.$refs.image_input.value = null;
                this.answer = '';
                this.hint1 = '';
                this.hint2 = '';
                this.hint3 = '';
              })
              .catch((err) => {
                console.log(err);
              });
          })
          .catch((err) => {
            console.log(err);
          });
      },
      deleteProblem(title) {
        axios.delete(`/api/admin/problems/${title}`)
          .then((res) => {
            this.problems = res.data;
          })
          .catch((err) => {
            console.log(err);
          });
      },
    },
    mounted() {
      axios.get('/api/admin/problems')
        .then((res) => {
          this.problems = res.data;
        })
        .catch((err) => {
          console.log(err);
        });
    },
  };

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
