const mongoose = require("mongoose");



const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        transactionId: {
            type: String,
            required: true,
            trim: true,
        },
        collegeName: {
            type: String,
            required: true,
            trim: true,
        },
        yearOfStudy: {
            type: String,
            required: true,
            trim: true,
        },
        branch: {
            type: String,
            required: true,
            trim: true,
        },
        isDualBooted: {
            type: Boolean,
            required: true,
            trim: true,
        },
        referralCode: {
            type: String,
            required: true,
            trim: true,
        },
        paymentImg: {
            type: String,
            required: true,
            trim: true,
        },
    },
);

const User = mongoose.model("user", userSchema);

module.exports = User;
