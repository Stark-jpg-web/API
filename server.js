const mongoose = require('mongoose');

process.loadEnvFile('./.env.local');
const app = require('./app');

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});

const DB_PATH = process.env.DATABASE.replace(
  '<DB_PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

connectToMongoDB = async () => {
  try {
    await mongoose.connect(DB_PATH);
    console.log('You successfully connected to MongoDB!');
  } catch (err) {
    console.dir(err);
  }
};
// Call this only when your application terminates
exports.disconnectFromMongoDB = async () => {
  await mongoose.disconnect();
  console.log('You successfully disconnected from MongoDB!');
};

connectToMongoDB();

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    maxlength: [40, 'Your name must not exceed 40 characters'],
    minlength: [3, 'Your name must be at least 3 characters long'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    trim: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide your password'],
    trim: true,
    minlength: [8, 'Your password must be at least 8 characters long'],
    maxlength: [12, 'Your password must not exceed 12 characters'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please provide your password confirm'],
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'admin'],
    default: 'user',
  },
});

const User = mongoose.model('User', userSchema);
const testUser = new User({
  name: 'Adel',
  email: 'adelashrafmuhammed@gmail.com ',
  password: 'password',
  passwordConfirm: 'password',
  role: 'admin',
});

testUser
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => {
    console.log(err.message);
  });
