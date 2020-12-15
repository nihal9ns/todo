const mongoose = require("mongoose");
const { Schema } = mongoose;

const TodoSchema = new Schema(
  {
    title: {
      type: String,
    },
    userId: {
      type: mongoose.Types.ObjectId,
    },
  },
  { timestamps: true }
);

const Todo = mongoose.model("Todo", TodoSchema);

module.exports = Todo;
