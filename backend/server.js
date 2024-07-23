const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { sendMessage } = require('./whatsapp'); 

const app = express();
app.use(cors());
app.use(express.json());

const triggersFilePath = path.join(__dirname, 'triggers.json');


const readTriggersFromFile = () => {
  if (!fs.existsSync(triggersFilePath)) {
    fs.writeFileSync(triggersFilePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(triggersFilePath, 'utf8');
  return JSON.parse(data);
};

const writeTriggersToFile = (triggers) => {
  fs.writeFileSync(triggersFilePath, JSON.stringify(triggers, null, 2));
};

let triggers = readTriggersFromFile();

const validateTrigger = (trigger) => {
  const requiredFields = ['messageType', 'interactiveType', 'header', 'body', 'button'];
  for (const field of requiredFields) {
    if (!trigger[field] || typeof trigger[field] !== 'string') {
      return false;
    }
  }
  return true;
};

app.get('/triggers', (req, res) => {
  res.json(triggers);
});

app.post('/triggers', (req, res) => {
  const newTrigger = req.body;
  triggers.push(newTrigger);
  writeTriggersToFile(triggers);
  res.json(newTrigger);
});

app.delete('/triggers/:id', (req, res) => {
  const { id } = req.params;
  triggers = triggers.filter(trigger => trigger.id != id);
  writeTriggersToFile(triggers);
  res.sendStatus(200);
});

app.put('/triggers/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const updatedTrigger = req.body;
  updatedTrigger.id = id;

  if (!validateTrigger(updatedTrigger)) {
    return res.status(400).json({ error: 'Invalid trigger format' });
  }

  const triggerIndex = triggers.findIndex(trigger => trigger.id === id);
  if (triggerIndex === -1) {
    return res.status(404).json({ error: 'Trigger not found' });
  }

  triggers[triggerIndex] = updatedTrigger;
  writeTriggersToFile(triggers);
  res.sendStatus(200);
});

app.post('/send-message', async (req, res) => {
  const trigger = req.body;
  console.log('Received trigger:', trigger);

  if (!validateTrigger(trigger)) {
    return res.status(400).json({ error: 'Invalid trigger format' });
  }

  const testTrigger = {
    messageType: 'Interactive',
    interactiveType: 'Button',
    header: 'Help Center',
    body: 'Thanks for contacting us. How may I help you?',
    button: 'Need Help?',
  };

  try {
    const result = await sendMessage(testTrigger);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error sending message:', error.message);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
