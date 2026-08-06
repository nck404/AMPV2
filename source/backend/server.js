require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");
const { createClient } = require("@libsql/client");
const { PrismaLibSQL } = require("@prisma/adapter-libsql");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://tfai.lol",
  "http://tfai.lol",
  "http://amp-web.surge.sh",
  "https://amp-web.surge.sh",
  "http://amp0.surge.sh",
  "https://amp0.surge.sh"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith("http://localhost:")) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true
};

const io = new Server(server, {
  cors: corsOptions
});

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Set up Prisma with Turso/libsql
const connectionString = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

let prisma;
if (connectionString.startsWith("libsql") || connectionString.startsWith("http")) {
    const libsql = createClient({
        url: connectionString,
        authToken: authToken,
    });
    const adapter = new PrismaLibSQL(libsql);
    prisma = new PrismaClient({ adapter });
} else {
    prisma = new PrismaClient();
}

app.set("prisma", prisma);

// Basic socket.io setup (similar to old python backend)
io.on("connection", (socket) => {
    console.log("Client connected via Socket.IO");

    socket.on("message", async (data) => {
        console.log(`Message received:`, data);
        io.emit("message", data);

        const content = data.content || data.text;
        const sender_id = data.sender_id;
        const receiver_id = data.receiver_id;

        if (content && sender_id) {
            try {
                await prisma.message.create({
                    data: {
                        sender_id: sender_id,
                        receiver_id: receiver_id,
                        content: content
                    }
                });
            } catch (err) {
                console.error("Socket error saving message:", err);
            }
        }
    });
});

// Import routers
const authRouter = require("./routes/auth");
const forumRouter = require("./routes/forum");
const chatRouter = require("./routes/chat");
const socialRouter = require("./routes/social");
const adminRouter = require("./routes/admin");
const docsRouter = require("./routes/docs");
const recruitmentRouter = require("./routes/recruitment");
const signLanguageRouter = require("./routes/sign_language");
const ttsRouter = require("./routes/tts");

app.use("/api", authRouter);
app.use("/api/forum", forumRouter);
app.use("/api/chat", chatRouter);
app.use("/api/social", socialRouter);
app.use("/api/admin", adminRouter);
app.use("/api/docs", docsRouter);
app.use("/api/recruitment", recruitmentRouter);
app.use("/api/sign-language", signLanguageRouter);
app.use("/api/tts", ttsRouter);

app.get("/", (req, res) => {
    res.send("AMP Neural Core Manager (Node.js) is Running!");
});

const PORT = 6333;
server.listen(PORT, () => {
    console.log(`--- Backend started on port ${PORT} ---`);
});
