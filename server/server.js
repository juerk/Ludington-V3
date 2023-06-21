const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, world!');
  });

const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://wuerk:NjqqgFt6baCCcX9@calendar.ubk8aj1.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

  

app.post('/register', async (req, res) => {
  const {username, password} = req.body;
  const user = new User({username, password});
  try {
    await user.save();
    res.status(200).send('Registered successfully');
  } catch(err) {
    res.status(500).send(err);
  }
});


app.post('/login', async (req, res) => {
  const {username, password} = req.body;
  const user = await User.findOne({username});
  user.comparePassword(password, (err, isMatch) => {
    if (!isMatch) {
      res.status(400).send('Invalid password');
    } else {
      jwt.sign({userId: user._id}, 'secretKey', {expiresIn: '1d'}, (err, token) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).send({token});
        }
      });
    }
  });
});

// ...

app.listen(3000, () => console.log('Server started on port 3000'));
