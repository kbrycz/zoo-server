require('dotenv').config(); // This should be at the top
require('./src/models/User');
require('./src/models/Post');
require('./src/models/Animal');


// Import all necessary dependencies
const express = require('express')
const mongoose = require('mongoose')

const authRoutes = require('./src/routes/auth/authRoutes')
const generalRoutes = require('./src/routes/general/generalRoutes')
const userRoutes = require('./src/routes/user/userRoutes')

// ****** Basic express set up ********

// Set up app object to use express library
const app = express()

// Basic api settings
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// For profile picture uploads
app.use(express.static('uploads'))
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));
app.use(express.json({ limit: '50mb' }));

// Handle the auth routes
app.use(authRoutes)

// Handle the general routes
app.use(generalRoutes)

// Handle the user routes
app.use(userRoutes)


// Get mongodb all set up with mongoose
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

// If mongoose connection works
mongoose.connection.on('connected', () => {
    console.log('Connected to mongo instance')
})

// If unable to connect to mongoose
mongoose.connection.on('error', (err) => {
    console.log('Error connecting to mongo: ' + err)
})

// ****** Start the application ********

const port = process.env.PORT || 8080; // Fallback to 8080 if process.env.PORT is not set
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});


// Basic route
app.get('/', (req, res) => {
    res.send('Hello World!');
  });