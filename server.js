const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const morgan = require("morgan");
const UserModel = require("./src/mongo/models/User");
const TodoModel = require("./src/mongo/models/Todo");

const { encode, decode } = require("./src/jwt");

const app = express();

app.use(bodyParser.json());
app.use(morgan("combined"));

mongoose
  .connect("mongodb://localhost:27017/todo-app", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.info("MongoDB connection established!!!"))
  .catch((error) =>
    console.error("MongoDB connection failed -> error : ", error)
  );

const PORT = 8000;

app.get("/", (req, res) => {
  res.send("ToDo App");
});

// user routes
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(403).json({ error: true, msg: "Invalid params" });
  }

  // check if email exists

  const userExist = await UserModel.findOne({ email });

  if (userExist) {
    return res
      .status(403)
      .json({ error: true, msg: "User with email already exists" });
  }

  await new UserModel({ email, password }).save();

  return res.status(200).json({ success: true });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(403).json({ error: true, msg: "Invalid params" });
  }

  const user = await UserModel.findOne({ email, password });

  if (user) {
    const token = encode({ userId: user._id });

    return res.status(200).json({ user, token });
  }

  return res.status(403).json({ error: true, msg: "User does not exists" });
});

// todo routes

// read
app.get("/todos", async (req, res) => {
  const token = req.headers["token"];
  console.debug("token : ", token);

  if (!token) {
    return res.status(403).json({ error: true, msg: "Token is required" });
  }

  const decoded = decode(token);

  if (decoded && decoded.userId) {
    const todos = await TodoModel.find({ userId: decoded.userId });
    return res.status(200).json({ todos });
  }

  return res.status(403).json({ error: true, msg: "Invalid auth" });
});

// create
app.post("/todo", async (req, res) => {
  const token = req.headers["token"];
  console.debug("token : ", token);

  if (!token) {
    return res.status(403).json({ error: true, msg: "Token is required" });
  }

  const decoded = decode(token);

  if (decoded && decoded.userId) {
    const { title } = req.body;

    if (!title) {
      return res.status(403).json({ error: true, msg: "Invalid params" });
    }

    await new TodoModel({ title, userId: decoded.userId }).save();

    return res.status(200).json({ success: true });
  }

  return res.status(403).json({ error: true, msg: "Invalid auth" });
});

// update
app.put("/todo", async (req, res) => {
  const token = req.headers["token"];
  console.debug("token : ", token);

  if (!token) {
    return res.status(403).json({ error: true, msg: "Token is required" });
  }

  const decoded = decode(token);

  if (decoded && decoded.userId) {
    const { todoId, title } = req.body;

    await TodoModel.updateOne(
      { _id: todoId, userId: decoded.userId },
      { $set: { title } }
    );

    return res.status(200).json({ success: true });
  }

  return res.status(403).json({ error: true, msg: "Invalid auth" });
});

// delete
app.delete("/todo", async (req, res) => {
  const token = req.headers["token"];
  console.debug("token : ", token);

  if (!token) {
    return res.status(403).json({ error: true, msg: "Token is required" });
  }

  const decoded = decode(token);

  if (decoded && decoded.userId) {
    const { todoId } = req.body;

    await TodoModel.deleteOne({ _id: todoId });

    return res.status(200).json({ success: true });
  }

  return res.status(403).json({ error: true, msg: "Invalid auth" });
});

app.listen(PORT, () => {
  console.info(`Server is now running on port ${PORT}!!!`);
});
