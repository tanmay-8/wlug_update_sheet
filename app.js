const express = require("express");
const mongoose = require("mongoose");
const { google } = require("googleapis");
const User = require("./User");

require("dotenv").config();

const app = express();

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

const spreadsheetId = process.env.SPREADSHEET_ID;

const cred = JSON.parse(process.env.GOOGLE_CREDENTIALS);

const authorize = async () => {
    const auth = new google.auth.GoogleAuth({
        credentials: cred,
        scopes: SCOPES,
    });

    const client = await auth.getClient();

    const  sheets  = google.sheets({ version: "v4", auth: client });

    return  sheets ;
};

const getData = async () => {
    try {
        const data = User.find();
        return data;
    } catch (err) {
        console.log(err);
    }
};

const transformData = (data) => {
    const headers = [
        "Full Name",
        "Branch",
        "Mobile No",
        "Email",
        "Favorite Quote",
        "Why Join Club",
        "Resume",
        "Photo",
        "Date",
    ];

    const newData = data.map((item) => {
        return [
            item.fullName,
            item.branch,
            item.mobileNo,
            item.email,
            item.favoriteQuote,
            item.whyJoinClub,
            item.resume,
            item.photo,
            item.date,
        ];
    });

    newData.unshift(headers);
    return newData;
};

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.post("/api/updateData", async (req, res) => {
    try {
        const users = await getData();
        const data = transformData(users);

        const  sheets  = await authorize();

        const response = await sheets.spreadsheets.values.update({
            spreadsheetId:spreadsheetId,
            range: "Sheet1!A1",
            valueInputOption: "RAW",
            resource: { values: data },
        })

        return res.send({
            data: response.data,
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

const connectToDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to the database");
    } catch (error) {
        console.log(error);
    }
};

const startServer = async () => {
    await connectToDb();
    app.listen(4000, () => {
        console.log("Server is running on port 4000");
    });
};

startServer();