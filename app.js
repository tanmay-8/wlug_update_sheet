const express = require("express");
const mongoose = require("mongoose");
const { google } = require("googleapis");
const { Counter, Participant, Registration } = require('./model');
require("dotenv").config();

const app = express();

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const spreadsheetId = process.env.SPREADSHEET_ID;
const cred = JSON.parse(process.env.GOOGLE_CREDENTIALS);
const adminpass = process.env.ADMIN;
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

const getData = async () => {
    try {
        const registrations = await Registration.find();
        let participantsData = [];

        for (const reg of registrations) {
            for (const participantId of reg.participants) {
                const participantData = await Participant.findOne({ pid: participantId });

                if (participantData) {
                    participantsData.push({
                        ...participantData.toObject(), // Convert Mongoose document to plain object
                        transactionImage: reg.transactionImage
                    });
                }
            }
        }

        participantsData.reverse();
        return participantsData;
    } catch (err) {
        console.log("Error fetching data:", err);
        return [];
    }
};

// Transform data to match Google Sheets format
const transformData = (data) => {
    const headers = [
        "pid",
        "name",
        "email",
        "phone",
        "collegeName",
        "yearOfStudy",
        "dualBoot",
        "createdAt",
        "updatedAt",
        "transactionImage"
    ];

    const newData = data.map((item) => {
        return [
            item.pid,
            item.name,
            item.email,
            item.phone,
            item.collegeName,
            item.yearOfStudy,
            item.dualBoot,
            item.createdAt,
            item.updatedAt,
            item.transactionImage
        ];
    });

    newData.unshift(headers);
    return newData;
};

// Route: Home
app.get("/", (req, res) => {
    res.send("Hello World");
});

// Route: Update Data to Google Sheets
app.post("/api/updateData", async (req, res) => {
    try {
        if (req.headers.authorization !== adminpass) {
            return res.send({
                success: false,
                message: "Unauthorized Access",
            });
        }

        const participants = await getData();
        const data = transformData(participants);

        const sheets = await authorize();

        await sheets.spreadsheets.values.update({
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
