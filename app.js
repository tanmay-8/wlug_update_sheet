const express = require("express");
const mongoose = require("mongoose");
const { google } = require("googleapis");
const User = require("./User");

require("dotenv").config();

const app = express();

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const spreadsheetId = process.env.SPREADSHEET_ID;
const cred = JSON.parse(process.env.GOOGLE_CREDENTIALS);
const admin = process.env.ADMIN;

// Authorize with Google Sheets API
const authorize = async () => {
    const auth = new google.auth.GoogleAuth({
        credentials: cred,
        scopes: SCOPES,
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    return sheets;
};

// Get Data from MongoDB
const getData = async () => {
    try {
        const data = await User.find();
        data.reverse();
        return data;
    } catch (err) {
        console.log(err);
    }
};

// Transform data to match Google Sheets format
const transformData = (data) => {
    const headers = [
        "fullName",
        "branch",
        "mobileNo",
        "email",
        "whyJoinClub",
        "resume",
        "photo",
        "date",
    ];

    const newData = data.map((item) => {
        return [
            item.fullName,
            item.branch,
            item.mobileNo,
            item.email,
            item.whyJoinClub,
            item.resume,
            item.photo,
            item.date,
        ];
    });

    newData.unshift(headers);
    return newData;
};

// Route: Home
app.get("/", (req, res) => {
    res.send("Hello World");
});

// Route: Get Data from MongoDB
app.get("/api/getData", async (req, res) => {
    try {
        if (!req.headers.authorization || req.headers.authorization !== admin) {
            return res.send({
                success: false,
                message: "Unauthorized",
            });
        }
        const users = await getData();
        return res.send({
            count: users.length,
            data: users,
            success: true,
        });
    } catch (err) {
        console.log(err);
        return res.send({
            success: false,
            message: "Something went wrong",
        });
    }
});

// Route: Update Data to Google Sheets
app.post("/api/updateData", async (req, res) => {
    try {
        if (!req.headers.authorization || req.headers.authorization !== admin) {
            return res.send({
                success: false,
                message: "Unauthorized",
            });
        }
        const users = await getData();
        const data = transformData(users);

        const sheets = await authorize();

        const response = await sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheetId,
            range: "Sheet1!A1",
            valueInputOption: "RAW",
            resource: { values: data },
        });

        return res.send({
            success: true,
            message: "Data Updated Successfully",
        });
    } catch (err) {
        console.log(err);
        return res.send({
            success: false,
            message: "Something went wrong",
        });
    }
});

// Connect to MongoDB
const connectToDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to the database");
    } catch (error) {
        console.log(error);
    }
};

// Start the server
const startServer = async () => {
    await connectToDb();
    app.listen(4000, () => {
        console.log("Server is running on port 4000");
    });
};

startServer();
