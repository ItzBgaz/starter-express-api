const express = require('express');
const bodyParser = require('body-parser');
const Saweria = require('./saweria'); // Import your Saweria class

const app = express();
const port = 3000; // Set your desired port

app.use(bodyParser.json());

const saweriaInstance = new Saweria();

// Create a route for login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await saweriaInstance.login(email, password);
  res.json(result);
});

// Create a route for creating payments
app.post('/create-payment', async (req, res) => {
  const { amount, msg } = req.body;
  const result = await saweriaInstance.createPayment(amount, msg);
  res.json(result);
});

// Create a route for checking payments
app.get('/check-payment/:id', async (req, res) => {
  const { id } = req.params;
  const result = await saweriaInstance.checkPayment(id);
  res.json(result);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
