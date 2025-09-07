const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Task = require("./models/Task");

const app = express();
const PORT = 5000; // ✅ backend runs on 5000
const JWT_SECRET = "mysecretkey"; // ⚠️ change in production

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/mern-todo-auth")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log(err));

// Middleware to check JWT
const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

// --------- AUTH ROUTES ---------
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = new User({ username, password: hashed });
    await user.save();
    res.json({ message: "User created" });
  } catch {
    res.status(400).json({ error: "User already exists" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Invalid password" });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// --------- TASK ROUTES ---------
app.get("/tasks", authMiddleware, async (req, res) => {
  const tasks = await Task.find({ userId: req.user.id });
  res.json(tasks);
});

app.post("/tasks", authMiddleware, async (req, res) => {
  const newTask = new Task({ text: req.body.text, userId: req.user.id });
  await newTask.save();
  res.json(newTask);
});

app.delete("/tasks/:id", authMiddleware, async (req, res) => {
  await Task.deleteOne({ _id: req.params.id, userId: req.user.id });
  res.json({ message: "Task deleted" });
});

// Start server
app.listen(PORT, () => console.log(`🚀 Backend running at http://localhost:${PORT}`));
