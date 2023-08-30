// const mongoose = require("mongoose");

// const callsSchema = new mongoose.Schema({
//     botName: String,
//     botPhoneNumber: String,
//     callerName: String,
//     callerPhoneNumber: String,
//     status: String,
//     date: String,
//     call_duration: Number,
//     messages: [
//       {
//         text: String,
//         timestamp: String,
//         sender: Number,
//       },
//     ],
//     frequency: Number,
//   });

//   const CallsHistory = mongoose.model('callsHitory', callsSchema);
//   module.exports = CallsHistory;

const mongoose = require("mongoose");

const callHistorySchema = new mongoose.Schema({
  botName: {
    type: String,
  },
  botPhoneNumber: {
    type: String,
  },
  callerName: {
    type: String,
  },
  callerPhoneNumber: {
    type: String,
  },
  status: {
    type: String,
  },
  date: {
    type: String,
  },
  messages: [
    {
      text: {
        type: String,
      },
      timestamp: {
        type: String,
      },
      sender: {
        type: Number,
      },
    },
  ],
  recordingURL: {
    type: String,
  },
  frequency: {
    type: Number,
  },
});
const CallHistory = mongoose.model("callHistory", callHistorySchema);
module.exports = CallHistory;
