const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
    seq: { type: Number, required: true }
});

const Counter = mongoose.model('counter', CounterSchema);

const ParticipantSchema = new mongoose.Schema({
    pid: { type: Number, unique: true, required: true }, // Unique participant ID
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    collegeName: { type: String, required: true },
    yearOfStudy: { type: Number, required: true },
    dualBoot: { type: Boolean, required: true },
    mailSent: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Participant = mongoose.model('participant', ParticipantSchema);

const RegistrationSchema = new mongoose.Schema({
    numOfParticipants: { type: Number, required: true },
    participants: [{ type: Number, ref: "participant" }], 
    totalAmount: { type: Number, required: true },
    transactionId: { type: String, required: true },
    transactionImage: { type: String, required: true },
    mailSent: { type: Boolean, default: false },
    referralCode: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});


const Registration = mongoose.model('registration', RegistrationSchema);

module.exports = { Counter, Participant, Registration };