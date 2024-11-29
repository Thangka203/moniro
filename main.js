const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const jsonServer = require("json-server");
const handlebars = require("express-handlebars");
const ngrok = require("ngrok");
require("dotenv").config();
var fs = require("fs");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const excelJs = require("exceljs");
const { isArray } = require("util");
const middlewares = jsonServer.defaults();
const port = process.env.PORT;

app.use(middlewares);

app.use(express.static("public"));

app.set("view engine", "hbs");

app.engine(
  "hbs",
  handlebars.engine({
    layoutsDir: __dirname + "/views",
    extname: "hbs",
  })
);

mongoose.connect("mongodb+srv://Thang:Thang123@moniro.08qt5.mongodb.net/?retryWrites=true&w=majority&appName=moniro");

const LocationSchema = new mongoose.Schema({
  a: Number,
  latitude: Number,
  longitude: Number,
  waterLevel: Number,
  date: String,
});

const Location = mongoose.model("Location", LocationSchema);

app.use(bodyParser.json());

app.post("/api/locations", async (req, res) => {
  const {a, longitude, latitude, waterLevel,date } = req.body;

  const newLocation = new Location({
    a, longitude, latitude, waterLevel, date
  });

  try {
    await newLocation.save();
    res.status(200).send("Du lieu da duoc luu");
  } catch(error) {
    res.status(500).send("loi khi luu du lieu");
  }
});

app.delete("/api/clear-data", async (req, res) => {
  try {
    await Location.deleteMany({});
    res.status(200).send("Du lieu da duoc xoa");
  } catch (error) {
    console.log("Loi khi xoa du lieu");
    res.status(500).send("loi server")
  }
});

app.get('/api/locations', async (req, res) => {
  try {
      const locations = await Location.find();
      res.status(200).json(locations);
  } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
      res.status(500).send('Lỗi server');
  }
});


app.get('/xem', (req, res) => {
  res.render('xem', {layout: false, apiKey: process.env.MAP_API_KEY});
});

app.get("/bao-cao", async (req, res) => {
  try {
    const data = req.query.date;
    const locations = await Location.find();
    console.log(locations)

    let workbook = new excelJs.Workbook();
    const sheet = workbook.addWorksheet("locations");

    sheet.columns = [
      { header: "a", key: "a", width: 50 },
      { header: "latitude", key: "latitude", width: 50 },
      { header: "longitude", key: "longitude", width: 50 },
      { header: "waterLevel", key: "waterLevel", width: 50 },
      { header: "date", key: "date", width: 50 },
    ];

    locations.forEach((value) => {
      sheet.addRow({
        a: value.a,
        latitude: value.latitude,
        longitude: value.longitude,
        waterLevel: value.waterLevel,
        date: value.date,
      });
    });

    // Set headers for Excel file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=${data}.xlsx`);

    // Write Excel file to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/", (req, res) => {
  res.render("main", { apiKey: process.env.MAP_API_KEY });
});

app.use(express.json()); // Add this line for parsing JSON bodies

app.use((req, res, next) => {
  if (req.method === "POST") {
    // req.body.createdAt = Date.now();
  }
  next();
});

app.use("/api", router); // Assuming you want to prefix your JSON Server API with '/api'

app.listen(port, () => {
  console.log("Server is running");
  console.log("http://localhost:3001/");
});
