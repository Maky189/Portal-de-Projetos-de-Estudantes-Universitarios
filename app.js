require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const projectsRouter = require('./routes/projects');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    if (process.env.NODE_ENV !== 'production') {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  },
}));

app.get('/', (req, res) => {
  res.json({
    name: 'Portal de Projetos de Estudantes Universitarios API',
    version: '1.0.0',
    endpoints: {
      'POST   /auth/register': 'register a new user (githubProfile required; imports public repos)',
      'POST   /auth/login': 'login and obtain a JWT',
      'GET    /auth/me': 'current authenticated user (requires Bearer token)',
      'GET    /users': 'list users',
      'GET    /users/:id/projects': 'list projects of a specific user',
      'GET    /projects': 'list projects of the authenticated user (auth required)',
      'GET    /projects/:id': 'get a project by id',
      'POST   /projects': 'create a project (auth required)',
      'PUT    /projects/:id': 'update own project (auth required)',
      'DELETE /projects/:id': 'delete own project (auth required)',
    },
  });
});

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/projects', projectsRouter);

app.use((req, res, next) => next(createError(404)));

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
