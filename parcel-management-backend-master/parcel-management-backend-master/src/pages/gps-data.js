import express from "express";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

const app = express();
const port = 3000;

const arduinoPort = new SerialPort("COM5", { baudRate: 9600 });
const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: "\n" }));

let gpsData = { latitude: null, longitude: null };



parser.on("data", (line) => {
  try {
    const parsedData = JSON.parse(line.trim());
    if (parsedData.latitude && parsedData.longitude) {
      gpsData = {
        latitude: parseFloat(parsedData.latitude),
        longitude: parseFloat(parsedData.longitude),
      };
    } else {
      console.error("Invalid GPS data received:", line);
    }
  } catch (error) {
    console.error("Error parsing GPS data:", error);
  }
});

app.get("/gps-data", async (req, res) => {
  try {
    if (gpsData.latitude !== null && gpsData.longitude !== null) {
      res.json({
        status: "success",
        message: "GPS data fetched successfully",
        data: gpsData,
      });
    } else {
      res.json({
        status: "error",
        message: "GPS data is unavailable",
        data: gpsData,
      });
    }
  } catch (error) {
    console.error("Error handling /gps-data request:", error);
    res.json({
      status: "error",
      message: "An error occurred while fetching GPS data",
    });
  }
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
