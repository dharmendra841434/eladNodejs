const mongoose = require("mongoose");

const botSchemas = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  details: {
    type: Object,
    required: true,
  },
  status: {
    type: String,
    require: true,
  },
  bot_settings: {
    type: Object,
    required: true,
  },
});
const Bots = mongoose.model("bots", botSchemas);
module.exports = Bots;
