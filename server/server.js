const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const Reservation = require('./models/reservation');
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
  const { email, password, firstName, lastName } = req.body;
  const user = new User({ email, password, firstName, lastName });
  try {
    await user.save();
    res.status(200).send('Registered successfully');
  } catch(err) {
    res.status(500).send(err);
  }
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
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

// Reservation endpoints
app.post('/reservations', async (req, res) => {
  const { dateStart, dateEnd, numberOfPeople, note, userId } = req.body;
  const reservation = new Reservation({ dateStart, dateEnd, numberOfPeople, note, userId });
  try {
    await reservation.save();
    res.status(200).send('Reservation created successfully');
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.find();
    res.status(200).json(reservations);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.put('/reservations/:id', async (req, res) => {
  const { dateStart, dateEnd, numberOfPeople, note, userId } = req.body;
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).send('Reservation not found');
    }
    if (reservation.userId.toString() !== userId) {
      return res.status(403).send('Unauthorized');
    }
    reservation.dateStart = dateStart;
    reservation.dateEnd = dateEnd;
    reservation.numberOfPeople = numberOfPeople;
    reservation.note = note;
    await reservation.save();
    res.status(200).send('Reservation updated successfully');
  } catch (err) {
    res.status(500).send(err);
  }
});

app.delete('/reservations/:id', async (req, res) => {
  const { userId } = req.body;
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).send('Reservation not found');
    }
    if (reservation.userId.toString() !== userId) {
      return res.status(403).send('Unauthorized');
    }
    await reservation.remove();
    res.status(200).send('Reservation deleted successfully');
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(3000, () => console.log('Server started on port 3000'));
