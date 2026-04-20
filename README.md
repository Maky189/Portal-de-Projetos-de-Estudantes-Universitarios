## How to install
```bash
npm install
```
## On MacOS or Linux, run the app with this command:
```bash
DEBUG=myapp:* npm start
```
## On Windows Command Prompt, use this command:
```bash
set DEBUG=myapp:* & npm start
```
## On Windows PowerShell, use this command:
```bash
$env:DEBUG='myapp:*'; npm start
```

## Directory Structure:
```
├── app.js
├── bin
│   └── www
├── package.json
├── public
│   ├── images
│   ├── javascripts
│   └── stylesheets
│       └── style.css
├── routes
│   ├── index.js
│   └── users.js
└── views
    ├── error.pug
    ├── index.pug
    └── layout.pug

7 directories, 9 files
```
