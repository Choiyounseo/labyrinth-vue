<template>
  <div>
    <h1>Hello, labyrinth!</h1>
    <h2>새 스토리 만들기</h2>
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
      <input type="file" id="image_input" name="image" ref="image_input" @change="onFileChange($event)" />
    </div>
    <button id="new_story_btn" @click="createStory()">스토리 만들기</button>
    <hr />
    <div id="story_list" v-for="story in stories">
      <div>
        <span>스토리 이름 : {{ story.title }}</span>
        <button @click="deleteStory(story.title)" style="float: right">삭제</button>
      </div>
      <p>스토리 번호 : {{ story.number }}</p>
      <p>스토리 사진 :</p>
      <img :src="'/static/storyImages/' + story.imageName" width="600"/>
      <hr />
    </div>
  </div>
</template>

<script>
  import axios from 'axios';
  import { mapState, mapActions } from 'vuex';

  export default {
    name: 'Main',
    data() {
      return {
        stories: [],
        title: '',
        number: '',
        file: '',
      };
    },
    computed: {
      ...mapState(['user']),
    },
    methods: {
      ...mapActions([
        'updateUser',
      ]),
      onFileChange(e) {
        this.file = e.target.files[0];
        console.log(this.file);
      },
      createStory() {
        const fd = new FormData();
        fd.append(this.file.name, this.file);
        axios.post('/api/admin/stories/detail', {
          title: this.title,
          number: Number(this.number),
          imageName: this.file.name,
        })
          .then((res1) => {
            console.log('first success', res1);
            axios.post('/api/admin/stories/image', fd)
              .then((res2) => {
                console.log('second success', res2);
                this.stories = res2.data;
                this.title = '';
                this.number = '';
                this.$refs.image_input.value = null;
                this.file = '';
              })
              .catch((err) => {
                console.log(err);
              });
          })
          .catch((err) => {
            console.log(err);
          });
      },
      deleteStory(title) {
        axios.delete(`/api/admin/stories/${title}`)
          .then((res) => {
            this.stories = res.data;
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
      axios.get('/api/admin/stories')
        .then((res) => {
          this.stories = res.data;
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
