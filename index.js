const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const ejs = require('ejs');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');

// Set up EJS as the view engine
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Middleware for parsing cookies and managing sessions
app.use(cookieParser());
app.use(session({
    secret: 'secretKey', // Change this to a secure secret key
    resave: false,
    saveUninitialized: false,
}));

// Middleware for parsing JSON requests
app.use(express.json());

// Middleware to check if the user is authenticated
function checkAuthenticated(req, res, next) {
    if (req.session.isAuthenticated) {
        return next();
    }

    res.redirect('/login');
}

// Middleware to check if the user is not authenticated
function checkNotAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        return next();
    }

    res.redirect('/dashboard');
}

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login')
})

app.get('/register', checkAuthenticated, (req, res) => {
    
})

// Login route
app.post('/login', checkNotAuthenticated, (req, res) => {
    const { email, password } = req.body;
    console.log(req.body)
    // Check if email and password are correct (for demonstration purposes)
    if (email === 'foo' && password === 'bar') {
        // Simulate user authentication
        req.session.isAuthenticated = true;

        // Generate a JWT token with userID
        const userID = '1234567890';
        const token = jwt.sign({ userID }, 'secretKey'); // Change this to a secure secret key

        // Set the token and userID in the session
        req.session.userID = userID;
        req.session.token = token;

        res.cookie('token', token);

        res.redirect('/dashboard');
    } else {
        res.status(401).send('Unauthorized');
    }
});

// Dashboard route (requires authentication)
app.get('/dashboard', checkAuthenticated, (req, res) => {
    // Render the dashboard with the userID
    const userID = req.session.userID;
    console.log(userID)
    res.render('dashboard', {
        userID
    });
});

// Logout route
app.get('/logout', (req, res) => {
    // Clear the session and token cookie
    req.session.destroy();
    res.clearCookie('token');
    res.redirect('/login');
});

app.get('/profile', (req, res) => {
    if (req.query.id) {
        let userID = req.query.id;
        console.log(userID)
        try {
            let profile = JSON.parse(fs.readFileSync(`database/${userID}.json`, 'utf8'));
            
            res.render('profile', {
                profile: profile,
            })

        } catch (err) {
            if (err) {
                return res.send('Profile doesnt exist!');
            }
        }
    } else {
        return res.send('Invalid URL!')
    }
})

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});