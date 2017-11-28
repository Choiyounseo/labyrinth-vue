// import multiparty from 'multiparty';
// import fs from 'fs';
const multiparty = require('multiparty');
const fs = require('fs');

const UserSchema = require('./../models/userInfo.js');
const ProblemSchema = require('./../models/problemInfo.js');
const StorySchema = require('./../models/storyInfo.js');
const LogSchema = require('./../models/logInfo.js');

const classNum = 26;
// const wordList = [
//   'agreement',
//   'broadcast',
//   'crazyarcade',
//   'dreaming',
//   'elementary',
//   'frustrating',
//   'greeting',
//   'hospital',
//   'initiate',
//   'jacobian',
//   'kindergarden',
//   'literature',
//   'migration',
//   'notificate',
//   'operation',
//   'previous',
//   'quadratic',
//   'response',
//   'statistics',
//   'triangle',
//   'ultimate',
//   'vulnerable',
//   'wednesday',
//   'xylitol',
//   'yesterday',
//   'zookeeper',
// ];
//
// const numberList = [
//   538,
//   1264,
//   5241,
//   961,
//   4216,
//   6510,
//   693,
//   7949,
//   768,
//   5161,
//   1524,
//   2168,
//   9059,
//   9819,
//   6344,
//   1505,
//   871,
//   1286,
//   6194,
//   8972,
//   1929,
//   120,
//   6108,
//   9088,
//   5218,
//   1258,
// ];

module.exports = (app, passport) => {
  let problemList = [];
  let storyList = [];

  ProblemSchema.find({}, (err, problemInfos) => {
    if (err) return;
    problemList = problemInfos.sort((p1, p2) => {
      if (p1.number < p2.number) return -1;
      if (p1.number === p2.number) {
        if (p1.title < p2.title) return -1;
        if (p1.title > p2.title) return 1;
        return 0;
      }
      return 1;
    });
  });

  StorySchema.find({}, (err, storyInfos) => {
    if (err) return;
    storyList = storyInfos.sort((p1, p2) => {
      if (p1.number < p2.number) return -1;
      if (p1.number === p2.number) {
        if (p1.title < p2.title) return -1;
        if (p1.title > p2.title) return 1;
        return 0;
      }
      return 1;
    });
  });

  app.get('/api/users/reset', (req, res) => {
    UserSchema.remove({}, (err) => {
      if (err) return res.status(500);
      LogSchema.remove({}, (err) => {
        if (err) return res.status(500);
        for (let i = 1; i <= classNum; i += 1) {
          const userInfo = new UserSchema();
          // userInfo.id = `class${i}`;
          // userInfo.password = `${wordList[i-1]}${numberList[i-1] < 1000 ? '0' + numberList[i-1] : numberList[i-1]}`;
          userInfo.id = `${i}`;
          userInfo.password = `${i}`;
          userInfo.name = `class${i}`;
          userInfo.progress = 0;
          userInfo.last_success = new Date();
          userInfo.timer_start = null;
          userInfo.save((err) => {
            if (err) return res.status(500).end('database error');
            const logInfo = new LogSchema();
            logInfo.id = userInfo.id;
            logInfo.log_start = [];
            logInfo.log_end = [];
            logInfo.save((err) => {
              if (err) return res.status(500).end('database error');
              res.end('success!');
            });
          });
        }

        const userInfo = new UserSchema();
        userInfo.id = 'admin';
        // userInfo.password = 'labyrinth2017admin';
        userInfo.password = 'admin';
        userInfo.name = 'admin';
        userInfo.progress = 1000;
        userInfo.last_success = new Date();
        userInfo.timer_start = null;
        userInfo.save((err) => {
          if (err) return res.status(500).end('database error');
          const logInfo = new LogSchema();
          logInfo.id = userInfo.id;
          logInfo.log_start = [];
          logInfo.log_end = [];
          logInfo.save((err) => {
            if (err) return res.status(500).end('database error');
            res.end('success!');
          });
        });
      });
    });
  });

  app.get('/api/user', (req, res) => {
    res.json({
      user: req.user,
      pastTime: new Date() - new Date(req.user.timer_start),
    });
  });

  app.post('/api/login', passport.authenticate('local'), (req, res) => {
    res.json(req.user);
  });

  app.get('/api/problems', (req, res) => {
    res.json(problemList.slice(0, req.user.progress));
  });

  app.get('/api/problems/:number', (req, res) => {
    function userTimerStart(id) {
      return new Promise((resolve, reject) => {  /* if first time to see problem. */
        UserSchema.findOne({ id }, (err, userInfo) => {
          if (err || !userInfo) reject();
          userInfo.timer_start = new Date();
          userInfo.save((err) => {
            if (err) reject();
            resolve(userInfo);
          });
        });
      });
    }

    function createNewLog(id, userInfo) {
      return new Promise((resolve, reject) => {
        LogSchema.findOneAndUpdate({
          id,
        }, {
          $push: { log_start: userInfo.timer_start },
        }, {
          new: true,
        }, (err, logInfo) => {
          if (err || !logInfo) reject();
          if (logInfo.log_start.length !== Number(req.user.progress) + 1)
            logInfo.log_start.pop();
          logInfo.save((err) => {
            if (err) reject();
            resolve();
          });
        });
      });
    }

    if (req.params.number > req.user.progress + 1)      /* if user does not solved previous problem yet. */
      return res.status(401);
    if (req.params.number > problemList.length + 1)     /* if no such problem exists. */
      return res.status(404);
    if (req.params.number == problemList.length + 1) {  /* if requested problem number is right next to the last problem. */
      if (req.user.timer_start)
        return res.json({ finished: true });  /* if user already entered ending. */
      userTimerStart(req.user.id)
        .then(() => {
          res.json({ finished: true });
        })
        .catch(() => {
          res.status(500);
        });
    }
    else { /* if needed to respond with problem normally. */
      const problem = problemList[req.params.number - 1];
      if (req.params.number <= req.user.progress || req.user.timer_start)
        return res.json({ problem }); /* if already solved or once seen problem. */
      userTimerStart(req.user.id)
        .then((userInfo) => {
          return createNewLog(req.user.id, userInfo);
        })
        .then(() => {
          res.json({ problem });
        })
        .catch(() => {
          res.status(500);
        });
    }
  });

  app.post('/api/problems/:number/answer', (req, res) => {
    if (req.params.number > req.user.progress + 1)  /* if answer for not-yet-seen problems. */
      return res.status(401);

    new Promise((resolve, reject) => {
      ProblemSchema.findOne({ number: req.params.number }, (err, problemInfo) => {
        if (err || !problemInfo) reject();
        if (problemInfo.answer !== req.body.answer) return res.json({ correct: false });
        if (req.params.number <= req.user.progress) return res.json({ correct: true });
        resolve();
      });
    })
      .then(() => {
        new Promise((resolve, reject) => {
          UserSchema.findOne({ id: req.user.id }, (err, userInfo) => {
            if (err || !userInfo) reject();
            userInfo.progress = req.params.number;
            userInfo.timer_start = null;
            userInfo.save((err) => {
              if (err) reject();
              resolve();
            });
          });
        });
      })
      .then(() => {
        new Promise((resolve, reject) => {
          LogSchema.findOneAndUpdate({
            id: req.user.id,
          }, {
            $push: { log_end: new Date() },
          }, {
            new: true,
          }, (err, logInfo) => {
            if (err || !logInfo) reject();
            if (logInfo.log_end.length !== Number(req.user.progress + 1))
              logInfo.log_end.pop();
            logInfo.save((err) => {
              if (err) reject();
              return res.json({ correct: true });
            });
          });


          // LogSchema.findOne({ id: req.user.id }, (err, logInfo) => {
          //   if (err) reject();
          //   logInfo.log_end[req.params.number - 1] = new Date();
          //   logInfo.save((err) => {
          //     if (err) reject();
          //     return res.json({ correct: true });
          //   });
          // });
        });
      })
      .catch(() => {
        res.status(500);
      });
  });

  app.get('/api/problems/:problemNum/hints', (req, res) => {
    ProblemSchema.findOne({ number: req.params.problemNum }, (err, problemInfo) => {
      if (err) return res.status(500);
      if (!problemInfo) return res.status(500);
      if (req.params.problemNum != req.user.progress + 1 || req.user.timer_start === null) return res.json({ hints: [] });

      let pastTime = new Date() - new Date(req.user.timer_start);
      if (pastTime >= 15*60*1000) return res.json({ hints: problemInfo.hint });
      if (pastTime >= 10*60*1000) return res.json({ hints: problemInfo.hint.slice(0, 2)});
      if (pastTime >= 5*60*1000) return res.json({ hints: problemInfo.hint.slice(0, 1)});
      return res.json({ hints: [] });
    });
  });

  app.get('/api/stories', (req, res) => {
    res.json(storyList.slice(0, req.user.progress + 1));
  });

  app.get('/api/stories/:number', (req, res) => {
    if (req.params.number >= storyList.length) {
      return res.status(500);
    }
    res.json({ story: storyList[req.params.number] });
  });

  app.get('/api/admin/logs', (req, res) => {
    LogSchema.find({}, (err, logInfos) => {
      if (err) return res.status(500);
      res.json(logInfos);
    });
  });

  app.get('/api/admin/problems', (req, res) => {
    res.json(problemList);
  });

  app.post('/api/admin/problems/detail', (req, res) => {
    let problemInfo = new ProblemSchema();
    problemInfo.title = req.body.title;
    problemInfo.number = req.body.number;
    problemInfo.imageName = req.body.imageName;
    problemInfo.answer = req.body.answer;
    problemInfo.hint = [
      req.body.hint1,
      req.body.hint2,
      req.body.hint3,
    ],
    problemInfo.save((err) => {
      if (err) return res.status(500);
      res.end(null);
    });
  });

  app.post('/api/admin/problems/image', (req, res) => {
    let form = new multiparty.Form();
    // get field name & value
    form.on('field', function(name, value) {
      console.log('normal field / name = ' + name + ' , value = ' + value);
    });

    // file upload handling
    form.on('part', function(part) {
      let filename;
      let size;
      if (part.filename) {
        filename = part.filename;
        size = part.byteCount;
      } else {
        part.resume();
      }

      console.log("Write Streaming file :" + filename);
      let writeStream = fs.createWriteStream(__dirname + '/../../../static/problemImages/' + filename);
      writeStream.filename = filename;
      part.pipe(writeStream);

      part.on('data', function(chunk) {
        console.log(filename + ' read ' + chunk.length + 'bytes');
      });

      part.on('end', function() {
        console.log(filename + ' Part read complete');
        ProblemSchema.findOne({ imageName: filename }, (err, problemInfo) => {
          if (err) return res.status(500);
          if (!problemInfo) return res.json({ success: false });
          updateProblemList(res);
        });
        writeStream.end();
      });
    });

    // all uploads are completed
    form.on('close', function() {
      console.log('Upload complete');
    });

    // track progress
    form.on('progress', function(byteRead,byteExpected) {
      console.log(' Reading total  ' + byteRead + '/' + byteExpected);
    });

    form.parse(req);
  });

  app.delete('/api/admin/problems/:title', (req, res) => {
    ProblemSchema.findOne({ title: req.params.title }, (err, problemInfo) => {
      if (err) return res.status(500);
      if (!problemInfo) return res.json({ success: false });
      ProblemSchema.remove({ title: req.params.title }, (err) => {
        if (err) return res.status(500);
        fs.unlink(__dirname + `/../../../static/problemImages/${problemInfo.imageName}`, (err) => {
          if (err) console.log(err);
          updateProblemList(res);
        });
      });
    });
  });

  function updateProblemList(res) {
    ProblemSchema.find({}, (err, problemInfos) => {
      if (err) return res.status(500);
      problemList = problemInfos.sort((p1, p2) => {
        if (p1.number < p2.number) return -1;
        if (p1.number === p2.number) {
          if (p1.title < p2.title) return -1;
          if (p1.title > p2.title) return 1;
          return 0;
        }
        return 1;
      });
      res.json(problemList);
    });
  }

  app.get('/api/admin/stories', (req, res) => {
    res.json(storyList);
  });

  app.post('/api/admin/stories/detail', (req, res) => {
    let storyInfo = new StorySchema();
    storyInfo.title = req.body.title;
    storyInfo.number = req.body.number;
    storyInfo.imageName = req.body.imageName;
    storyInfo.save((err) => {
      if (err) return res.status(500);
      res.end(null);
    });
  });

  app.post('/api/admin/stories/image', (req, res) => {
    let form = new multiparty.Form();
    // get field name & value
    form.on('field', function(name, value) {
      console.log('normal field / name = ' + name + ' , value = ' + value);
    });

    // file upload handling
    form.on('part', function(part) {
      let filename;
      let size;
      if (part.filename) {
        filename = part.filename;
        size = part.byteCount;
      } else {
        part.resume();
      }

      console.log("Write Streaming file :" + filename);
      let writeStream = fs.createWriteStream(__dirname + '/../../../static/storyImages/' + filename);
      writeStream.filename = filename;
      part.pipe(writeStream);

      part.on('data', function(chunk) {
        console.log(filename + ' read ' + chunk.length + 'bytes');
      });

      part.on('end', function() {
        console.log(filename + ' Part read complete');
        StorySchema.findOne({ imageName: filename }, (err, storyInfo) => {
          if (err) return res.status(500);
          if (!storyInfo) return res.json({ success: false });
          updateStoryList(res);
        });
        writeStream.end();
      });
    });

    // all uploads are completed
    form.on('close', function() {
      console.log('Upload complete');
    });

    // track progress
    form.on('progress', function(byteRead, byteExpected) {
      console.log(' Reading total  ' + byteRead + '/' + byteExpected);
    });

    form.parse(req);
  });

  app.delete('/api/admin/stories/:title', (req, res) => {
    StorySchema.findOne({ title: req.params.title }, (err, storyInfo) => {
      if (err) return res.status(500);
      if (!storyInfo) return res.json({ success: false });
      StorySchema.remove({ title: req.params.title }, (err) => {
        if (err) return res.status(500);
        fs.unlink(__dirname + `/../../../static/storyImages/${storyInfo.imageName}`, (err) => {
          if (err) console.log(err);
          updateStoryList(res);
        });
      });
    });
  });

  function updateStoryList(res) {
    StorySchema.find({}, (err, storyInfos) => {
      if (err) return res.status(500);
      storyList = storyInfos.sort((p1, p2) => {
        if (p1.number < p2.number) return -1;
        if (p1.number === p2.number) {
          if (p1.title < p2.title) return -1;
          if (p1.title > p2.title) return 1;
          return 0;
        }
        return 1;
      });
      res.json(storyList);
    });
  }
}
