const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const fs = require('fs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const ensureAuthenticated = require('./middleware/authMiddleware');


dotenvpath = path.join('../.env');


if (fs.existsSync(dotenvpath)) {
    const config = dotenv.config({ path: path.join(__dirname, '../../.env') });
    console.log('Environment file Loaded!');
    dotenvExpand.expand(config);
}else{
  console.log('Environment file not Loaded or Variables in System');

}

const dinosaurRoutes = require('./routes/dinosaurRoutes');
const userRoutes = require('./routes/userRoutes');
const DinosaurController = require('./controllers/dinosaurController');

console.log(process.env.DATABASE_URL);

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Configure session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Initiate Prisma client
const prisma = new PrismaClient();

// Function to create default user
async function createDefaultUser() {
  const hashedPassword = await bcrypt.hash('dino', 10);

  const user = await prisma.Login.upsert({
    where: { username: 'demo' },
    update: {},
    create: {
      username: 'demo',
      password: hashedPassword,
      email: 'dino@dinovoteapp.com',
    },
  });

  console.log('Default user created:', user);
}

// Call the function to create default user
createDefaultUser().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});


// Passport local strategy
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await prisma.Login.findUnique({ where: { username } });
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Passport Google strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
},
async (token, tokenSecret, profile, done) => {
  try {
    let user = await prisma.Login.findUnique({ where: { provider_id: profile.id } });
    if (!user) {
      user = await prisma.Login.create({
        data: {
          username: profile.displayName,
          email: profile.emails[0].value,
          provider: 'google',
          provider_id: profile.id,
          password: 'google', // Google doesn't provide password
        }
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}
));

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.Login.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Middleware to make user info available in all templates
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});


// For direct data fetching
async function init() {
  try {
    const dinosaurs = await DinosaurController.getAllDinosaurs();
    return dinosaurs;
  } catch (error) {
    console.error('Error fetching dinosaurs:', error);
    return [];
  }
}

// Initialize your data
//const dinos = init();


//// Define routes

app.get('/', ensureAuthenticated, async (req, res) => {
  const dinosaurs = await DinosaurController.getSomeDinosaurs(); 
  res.render('index', { dinosaurs: dinosaurs });
});
app.use('/dinosaurs', ensureAuthenticated, dinosaurRoutes);
app.get('/dinosaurs', ensureAuthenticated, DinosaurController.getDinosaurs);
app.post('/dinosaurs/vote/:id', ensureAuthenticated, DinosaurController.voteDinosaur);
app.post('/dinosaurs/fetch-images', ensureAuthenticated, DinosaurController.fetchNewImages);
app.get('/dinosaurs/:id', ensureAuthenticated, DinosaurController.getDinosaurById);
app.delete('/dinosaurs/:id', ensureAuthenticated, DinosaurController.deleteDinosaur);


app.use('/user', ensureAuthenticated, userRoutes);
app.get('/user/voted', ensureAuthenticated, DinosaurController.getUserVotes); 

// Login route
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

// Logout route
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

// Google OAuth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  }
);

//// End Routes


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;