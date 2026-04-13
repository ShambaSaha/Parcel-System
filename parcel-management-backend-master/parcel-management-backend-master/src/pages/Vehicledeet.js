const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json()); 

let vehicles = [];

// API Endpoint to handle vehicle details submission
app.post('/api/vehicles', (req, res) => {
  const { vehicleType, make, model, year, registrationNumber } = req.body;

  if (!vehicleType || !make || !model || !year || !registrationNumber) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const newVehicle = {
    id: vehicles.length + 1, 
    vehicleType,
    make,
    model,
    year,
    registrationNumber,
  };
  vehicles.push(newVehicle);

  res.status(201).json({ message: 'Vehicle added successfully!', vehicle: newVehicle });
});

app.get('/api/vehicles', (req, res) => {
  res.json(vehicles);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

  