const ReservationSchema = new mongoose.Schema({
    dateStart: { type: Date, required: true },
    dateEnd: { type: Date, required: true },
    numberOfPeople: { type: Number, required: true },
    note: { type: String, maxlength: 140 },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  });
  
  module.exports = mongoose.model('Reservation', ReservationSchema);
  