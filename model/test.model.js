const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, expires: "1hours" },
});
const Test = mongoose.model("automatic_delete", testSchema);
module.exports = Test;
