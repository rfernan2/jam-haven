const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const itemRoutes = require('./routes/itemRoutes');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const userRoutes = require('./routes/userRoutes');

// Create Express app
const app = express();

// Configure app
const port = 3000;
const host = 'localhost';
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use MongoDB Atlas URI
const mongURI = 'mongodb+srv://admin:Admin123@cluster0.elq91.mongodb.net/project5?retryWrites=true&w=majority&appName=Cluster0';

// Session config
app.use(session({
    secret: 'supersecretjamkey', // you can change this secret string
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongURI,
      collectionName: 'sessions'
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  }));

// After session setup
app.use(flash());

// Set flash messages globally
app.use((req, res, next) => {
  res.locals.successMessages = req.flash('success');
  res.locals.errorMessages = req.flash('error');
  next();
});

// Connect to MongoDB and start the server
mongoose.connect(mongURI, {
    
  })
  .then(() => {
      console.log("Connected to MongoDB Atlas 'project5'");
      app.listen(port, host, () => {
          console.log(`Server running at http://${host}:${port}`);
      });
  })
  .catch(err => console.error("DB connection error:", err));

// middleware
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.param("id", (req, res, next, id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        let err = new Error("Invalid ID format.");
        err.status = 400;
        return next(err);
    }
    next();
});

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.currentUser = req.session.user || null;
    next();
  });

// Routes
app.get('/', (req, res) => {
    res.render('index'); 
});

app.use('/users', userRoutes);

app.use('/items', itemRoutes); 

// Handle 404 Errors
app.use((req, res, next) => {
    let err = new Error(`The server cannot locate ${req.url}`);
    err.status = 404;
    next(err);
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.log(err.stack);
    if (!err.status) {
        err.status = 500;
        err.message = "Internal Server Error";
    }
    res.status(err.status).render('error', { error: err });
});
