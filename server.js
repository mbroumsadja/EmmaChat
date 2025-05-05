import { Server } from "socket.io";
import express from "express";
import { createServer } from "node:http";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {},
  cors: {
    origin: ["*"],
    methods: ["GET", "POST"],
  },
});

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: ("public", "uploads"),
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "text/plain",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only text, PDF, and Word files allowed."));
    }
  },
});

// Middleware
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "views");

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

// File upload route
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded or invalid file type." });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  io.emit("file shared", {
    filename: req.file.originalname,
    url: fileUrl,
    uploadedAt: new Date().toISOString(),
  });
  res.json({ message: "File uploaded successfully", url: fileUrl });
});

// Socket.IO events
io.on("connection", (socket) => {
  socket.on("chat message", (msg) => {
    if (typeof msg === "string" && msg.trim().length > 0) {
      io.emit("chat message", msg.trim());
    }
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err);
  });
});

// Error handling for server
server.on("error", (err) => {
  console.error("Server error:", err);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  server.close(() => {
    io.close();
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});