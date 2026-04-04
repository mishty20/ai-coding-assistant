import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import fs from "fs";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.post("/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    const formattedHistory = history.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    }));

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: formattedHistory,
    });

    const reply = response.choices[0].message.content;

    res.json({ reply });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ reply: "Error" });
  }
});

app.post("/signup", (req, res) => {
  const { email, password } = req.body;

  const users = JSON.parse(fs.readFileSync("users.json"));

  const userExists = users.find((u) => u.email === email);

  if (userExists) {
    return res.json({ message: "User already exists" });
  }

  const newUser = {
    id: Date.now().toString(),
    email,
    password,
  };

  users.push(newUser);

  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));

  res.json({ message: "Signup successful" });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const users = JSON.parse(fs.readFileSync("users.json"));

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return res.json({ message: "Invalid credentials" });
  }

  res.json({
    message: "Login successful",
    userId: user.id,
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});