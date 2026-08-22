import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const DB_FILE = path.join(__dirname, 'db.json');

// Serve static frontend files from 'dist' if built (for production hosting)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Default state helper
const readDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (e) {
    console.error("Error parsing db.json", e);
    return null;
  }
};

// Helper to write DB
const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error writing db.json", e);
  }
};

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  const sendCurrentState = () => {
    const currentDB = readDB();
    if (currentDB) {
      socket.emit('init_state', currentDB);
    }
  };

  sendCurrentState();

  socket.on('get_initial_state', () => {
    sendCurrentState();
  });

  // Listen for timeline updates
  socket.on('update_timeline', (newTimeline) => {
    const db = readDB() || {};
    db.timeline = newTimeline;
    writeDB(db);
    // Broadcast to everyone else connected
    socket.broadcast.emit('timeline_updated', newTimeline);
  });

  // Listen for budget updates
  socket.on('update_budget', (newBudget) => {
    const db = readDB() || {};
    db.budget = newBudget;
    writeDB(db);
    // Broadcast to everyone else connected
    socket.broadcast.emit('budget_updated', newBudget);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// SPA fallback for frontend routing
if (fs.existsSync(distPath)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Sync server running on port ${PORT}`);
});

