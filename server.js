if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

const PORT = process.env.PORT || 3000;

let localStorage;
if (typeof localStorage === 'undefined' || localStorage === null) {
  const LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}
let users = JSON.parse(localStorage.getItem('users')) || [];

const initializePassport = require('./passport-config');
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id),
);

app.set('view-engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());
// we override the post method in our form so we can use a delete
// method to work with passports req.logOut() method
app.use(methodOverride('_method'));

// ROOT GET ROUTE - change to member route, add unauthenticated splash root
app.get('/', checkAuthenticated, (req, res) => {
  // req.user.name provided by Passport only on authentication
  res.render('index.ejs', { name: req.user.name });
});

// LOGIN GET ROUTE - only if not logged in
app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs');
});

// LOGIN POST ROUTE - only if not logged in
app.post(
  '/login',
  checkNotAuthenticated,
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  }),
);

// REGISTER GET ROUTE - only if not logged in
app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs');
});

// REGISTER POST ROUTE - only if not logged in
app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    // users is an array in node-localStorage to which we push user objects
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    console.log(users);
    localStorage.setItem('users', JSON.stringify(users));
    res.redirect('/login');
  } catch {
    res.redirect('/register');
  }
});

// LOGOUT DELETE ROUTE
app.delete('/logout', (req, res) => {
  req.logOut();
  res.redirect('/login');
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
