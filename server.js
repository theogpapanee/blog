const express = require('express');
const articleRouter = require('./routes/articles');
const Article = require('./models/article');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const marked = require('marked');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const app = express();
require('dotenv').config();

// MongoDB connection
mongoose.connect(process.env.DB_URI);

app.use(session({ secret: process.env.SECRET_KEY, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Setup body parser and method override
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/loginfail', (req, res) => {
    res.render('loginfail');
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/loginfail',
}));

passport.use(new LocalStrategy((username, password, done) => {
    if (username == process.env.VALID_USERNAME && password == process.env.VALID_PASSWORD) {
        return done(null, { id: 1, username }); // Return user object
    } else {
        return done(null, false, { message: 'Incorrect credentials.' });
    }
}));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
    done(null, user.username);
});

passport.deserializeUser((username, done) => {
    done(null, { username }); // Deserialize the user
});

// Protect routes middleware
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/loginfail'); // Redirect to login page if not authenticated
}

// Apply routes
app.get('/', async (req, res) => {
    const articles = await Article.find().sort({ createdAt: 'desc' });
    let login = await req.isAuthenticated();
    res.render("articles/index.ejs", { articles: articles, login: login });
});

// Apply article routes
app.use('/articles', articleRouter);

app.listen(5000, () => {
    console.log('Server running on port 5000');
});
