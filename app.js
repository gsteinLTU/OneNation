require('dotenv').config();

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session')

const gameRoutes = require('./routes/game');
const errorController = require('./controllers/error');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');
app.set('trust proxy', 1);

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret: 'onenation',
    cookie: { maxAge: 60000 },
    resave: true,
    saveUninitialized: false,
}));

app.use('/', gameRoutes);

app.use(errorController.get404);

// Start server
const port = process.env.PORT || 3000;
app.listen(port);
console.log(`Listening on port ${port}`);
