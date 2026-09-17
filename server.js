require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const { MongoClient, GridFSBucket, ObjectId } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_UPLOAD_KEY = process.env.ADMIN_UPLOAD_KEY;

if (!ADMIN_UPLOAD_KEY) {
  console.error("ADMIN_UPLOAD_KEY is missing. Set it in your .env file so only you can upload/delete files.");
  process.exit(1);
}

/* Simple shared-secret check for actions only you should be able to do
   (uploading, deleting). Everyone can still view/download freely —
   this only gates the write operations. The frontend sends this key
   in a header after you type it into the Upload page. */
function requireAdminKey(req, res, next) {
  const providedKey = req.headers["x-admin-key"];
  if (providedKey !== ADMIN_UPLOAD_KEY) {
    return res.status(401).json({ error: "Invalid or missing admin key" });
  }
  next();
}

if (!MONGODB_URI) {
  console.error("MONGODB_URI is missing. Create a .env file (see .env.example).");
  process.exit(1);
}

/* ---------- Mongo connections ----------
   1. mongoose -> for normal collections (future auth, etc.)
   2. raw MongoClient + GridFSBucket -> for streaming files in/out of GridFS
--------------------------------------------- */

let bucket;
const mongoClient = new MongoClient(MONGODB_URI);

async function connectMongo() {
  await mongoose.connect(MONGODB_URI);
  console.log("Mongoose connected");

  await mongoClient.connect();
  const db = mongoClient.db();
  bucket = new GridFSBucket(db, { bucketName: "uploads" });
  console.log("GridFS bucket ready");
}

/* ---------- Multer (memory storage) ----------
   We hold the uploaded file in memory briefly, then stream it into
   GridFS ourselves below. This avoids relying on the unmaintained
   multer-gridfs-storage package, which is broken against modern
   versions of the MongoDB driver. */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB per file cap
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, PPT/PPTX, and DOC/DOCX files are allowed"));
    }
  },
});

/* ---------- Routes ---------- */

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Upload a file for a given subject + module
app.post("/api/upload", requireAdminKey, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const { subject, module } = req.body;
  const filename = `${Date.now()}-${req.file.originalname}`;

  const uploadStream = bucket.openUploadStream(filename, {
    metadata: {
      subject: subject || "unknown",
      module: module || "unknown",
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
    },
  });

  uploadStream.end(req.file.buffer);

  uploadStream.on("finish", () => {
    res.json({
      message: "File uploaded successfully",
      file: {
        id: uploadStream.id,
        filename,
        subject,
        module,
      },
    });
  });

  uploadStream.on("error", (err) => {
    console.error("GridFS upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  });
});

// List files for a subject + module
app.get("/api/files/:subject/:module", async (req, res) => {
  try {
    const { subject, module } = req.params;
    const files = await mongoClient
      .db()
      .collection("uploads.files")
      .find({ "metadata.subject": subject, "metadata.module": module })
      .sort({ uploadDate: -1 })
      .toArray();

    const result = files.map((f) => ({
      id: f._id,
      name: f.metadata?.originalName || f.filename,
      uploadDate: f.uploadDate,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

// Stream/download a specific file by its GridFS id
app.get("/api/file/:id", async (req, res) => {
  try {
    const fileId = new ObjectId(req.params.id);

    const files = await mongoClient
      .db()
      .collection("uploads.files")
      .find({ _id: fileId })
      .toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    const file = files[0];
    res.set("Content-Type", file.metadata?.mimetype || "application/octet-stream");
    res.set("Content-Disposition", `inline; filename="${file.metadata?.originalName || file.filename}"`);

    bucket.openDownloadStream(fileId).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch file" });
  }
});

// Delete a file (useful for correcting mistaken uploads)
app.delete("/api/file/:id", requireAdminKey, async (req, res) => {
  try {
    const fileId = new ObjectId(req.params.id);
    await bucket.delete(fileId);
    res.json({ message: "File deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

/* ---------- Start server ---------- */
connectMongo()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
