'use strict'
require('./check-versions')()

const config = require('../config')
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

const opn = require('opn')
const path = require('path')
const express = require('express')
const webpack = require('webpack')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const mongoose = require('mongoose')
const passport = require('passport')
const passportStrategy = require('passport-local').Strategy
const proxyMiddleware = require('http-proxy-middleware')
const webpackConfig = require('./webpack.dev.conf')

// default port where dev server listens for incoming traffic
const port = process.env.PORT || config.dev.port
// automatically open browser, if not set will be false
const autoOpenBrowser = !!config.dev.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
const proxyTable = config.dev.proxyTable

const app = express()
const compiler = webpack(webpackConfig)

const devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})

const hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: false,
  heartbeat: 2000
})
// force page reload when html-webpack-plugin template changes
// currently disabled until this is resolved:
// https://github.com/jantimon/html-webpack-plugin/issues/680
// compiler.plugin('compilation', function (compilation) {
//   compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
//     hotMiddleware.publish({ action: 'reload' })
//     cb()
//   })
// })

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  let options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

passport.use(new passportStrategy({
  usernameField: 'id',
  passwordField: 'password',
  passReqToCallback: true,
}, (req, id, password, done) => {
  require('./../src/server/models/userInfo.js').findOne({ id: id, password: password }, (err, userInfo) => {
    if (err) return done(null, false);
    if (!userInfo) return done(null, false);
    return done(null, userInfo);
  });
}));
passport.serializeUser((user, done) => {
  done(null, user.id);
})

passport.deserializeUser((id, done) => {
  require('./../src/server/models/userInfo.js').findOne({ id: id}, (err, userInfo) => {
    return done(err, userInfo);
  });
});

const db = mongoose.connection;
db.on('error', console.error);
db.once('open', () => {
  console.log('connected to mongod server');
});
mongoose.connect('mongodb://localhost/labyrinth');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'I love apple!',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/', (req, res, next) => {
  let urlTokens = req.originalUrl.split('/');
  if (!req.user && urlTokens[2] !== 'users' && urlTokens[2] !== 'login' && !(urlTokens[1] === 'static' && (urlTokens[2] === 'javascript' || urlTokens[2] === 'css' || urlTokens[2] === 'font.ttf')) && req.originalUrl !== '/login')
    res.redirect('/login');
  else
    next();
});
app.use('/static/problemImages/:imgName', (req, res, next) => {
  const imgName = req.params.imgName;
  const progress = req.user.progress;
  require('./../src/server/models/problemInfo.js').find({}, (err, problemInfos) => {
    if (err) {
      console.log(err);
      return;
    }
    problemInfos.sort((p1, p2) => {
      if (p1.number < p2.number) return -1;
      if (p1.number == p2.number) {
        if (p1.title < p2.title) return -1;
        if (p1.title > p2.title) return 1;
        return 0;
      }
      return 1;
    });

    for (let i = 0; i < problemInfos.length; i++) {
      if (problemInfos[i].imageName === imgName) {
        if (progress + 1 < problemInfos[i].number) {
          res.end('Go away, Anna!');
          return;
        } else {
          next();
        }
        break;
      }
    }
  });
});
app.use('/static/storyImages/:imgName', (req, res, next) => {
  const imgName = req.params.imgName;
  const progress = req.user.progress;
  require('./../src/server/models/storyInfo.js').find({}, (err, storyInfos) => {
    if (err) {
      console.log(err);
      return;
    }
    storyInfos.sort((p1, p2) => {
      if (p1.number < p2.number) return -1;
      if (p1.number == p2.number) {
        if (p1.title < p2.title) return -1;
        if (p1.title > p2.title) return 1;
        return 0;
      }
      return 1;
    });

    for (let i = 0; i < storyInfos.length; i++) {
      if (storyInfos[i].imageName === imgName) {
        if (progress + 1 < storyInfos[i].number) {
          res.end('Go away, Anna!');
          return;
        } else {
          next();
        }
        break;
      }
    }
  });
});
app.use('/admin', (req, res, next) => {
  if (req.user.id !== 'admin') {
    res.redirect('/not_allowed');
  } else {
    next();
  }
});

// serve pure static assets
const staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

const router = require('./../src/server/routes')(app, passport)

const uri = 'http://localhost:' + port

var _resolve
var _reject
var readyPromise = new Promise((resolve, reject) => {
  _resolve = resolve
  _reject = reject
})

var server
var portfinder = require('portfinder')
portfinder.basePort = port

console.log('> Starting dev server...')
devMiddleware.waitUntilValid(() => {
  portfinder.getPort((err, port) => {
    if (err) {
      _reject(err)
    }
    process.env.PORT = port
    var uri = 'http://localhost:' + port
    console.log('> Listening at ' + uri + '\n')
    // when env is testing, don't need open it
    if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
      opn(uri)
    }
    server = app.listen(port)
    _resolve()
  })
})

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}
