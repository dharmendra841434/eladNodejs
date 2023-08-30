const express = require("express");
require("./connection/connectDB");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Users = require("./model/users.model");
const Bots = require("./model/bot.model");
const Testing = require("./model/test.model");
const twilio = require("twilio");
const axios = require("axios");
dotenv.config();

const accountSid = "AC5699b25eca0767ef289a4d6c3a9e6175";
const authToken = "b2726a5cd2a5cb55c08e929e58560f9d";
const client = twilio(accountSid, authToken);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  try {
    res.status(200).send({ message: "This is root route " });
  } catch (err) {
    res.status(err.status || 500).json({
      status: false,
      response: err.message || "Internal Server Error",
    });
  }
});

app.post("/testing", (req, res) => {
  try {
    const document = new Testing({
      name: "dhruv gupta",
      createdAt: new Date(),
    });

    document
      .save()
      .then(() => {
        res.status(200).send("Document created successfully");
      })
      .catch((error) => {
        console.error("Error creating document:", error);
        res.status(500).send("Internal Server Error");
      });
  } catch (err) {
    res.status(err.status || 500).json({
      status: false,
      response: err.message || "Internal Server Error",
    });
  }
});

app.post("/google-auth", async (req, res) => {
  try {
    await axios
      .get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${req.body.token}`,
        },
      })
      .then(async (data) => {
        // Handle the userinfo data
        //console.log(data.data);

        const token = jwt.sign(data.data, "google scret token");
        const userData = await Users.findOne({ email: data.data.email });
        if (userData) {
          res.status(200).send({
            status: true,
            message: "Email Already Exist",
            token: token,
          });
        } else {
          res
            .status(200)
            .send({ status: true, message: "Email Not Exist", token: token });
        }
      })
      .catch((error) => {
        // Handle any errors
        // console.error(error.response.data);
        res
          .status(200)
          .send({ message: error.response.data.error_description });
      });
  } catch (err) {
    res.status(err.status || 500).json({
      status: false,
      response: err.message || "Internal Server Error",
    });
  }
});

// Api to restore the released twilio phone number
app.post("/restoring-phone-number", async (req, res) => {
  try {
    client.incomingPhoneNumbers
      .create({
        phoneNumber: "+13614597526",
      })
      .then((incoming_phone_number) => console.log(incoming_phone_number.sid));
  } catch (err) {
    console.log("failed");
    res.status(err.status || 500).json({
      status: false,
      response: err.message || "Internal Server Error",
    });
  }
});

app.post("/re-active-phone-number", async (req, res) => {
  try {
    client.incomingPhoneNumbers
      .create({
        phoneNumber: req.body.phoneNumberSid,
      })
      .then((purchasedNumber) => {
        console.log(
          "Successfully repurchased phone number:",
          purchasedNumber.phoneNumber
        );
      })
      .catch((error) => {
        console.error("Failed to repurchase phone number:", error);
      });
  } catch (err) {
    console.log(err);
    res.status(err.status || 500).json({
      status: false,
      response: err.message || "Internal Server Error",
    });
  }
});

//Verify Token Done
app.post("/verify-token", async (req, res) => {
  try {
    const decodedToken = jwt.decode(req.body.token);
    // console.log(decodedToken, "jgjasd");
    if (decodedToken) {
      const userData = await Users.findOne({ email: decodedToken.email });
      if (userData) {
        res
          .status(200)
          .send({ message: "This is verified Token", status: true });
      } else {
        res.status(200).send({ message: "This is wrong Token", status: false });
      }
    } else {
      res.status(200).send({ message: "Invalid Token", status: false });
    }

    //console.log(decodedToken, "token");
  } catch (err) {
    res.status(err.status || 500).json({
      status: false,
      response: err.message || "Internal Server Error",
    });
  }
});
//Register Route Done
app.post("/user/register", async (req, res) => {
  try {
    const hasPassword = await bcrypt.hash(req.body.password, 10);
    const user = new Users({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: hasPassword,
      phone: req.body.phone,
      country: req.body.country,
      address: req.body.address,
      timeZone: req.body.timeZone,
      businessInfo: req.body.businessInfo,
      deletedAt: req.body.deletedAt,
    });
    const userData = await Users.findOne({ email: req.body.email });
    if (userData) {
      res.status(200).send({ message: "email already exist" });
    } else {
      const payload = {
        firstname: req.body.firstname,
        email: req.body.email,
      };
      const token = jwt.sign(payload, "this is secret");
      const response = await user.save();
      // console.log("not error");
      res.status(200).send({
        success: true,
        accessToken: token,
      });
    }
  } catch (err) {
    console.log("error");
    res.status(err.status || 500).json({
      status: false,
      response: err.message || "Internal Server Error",
    });
  }
});
//Login route Done
app.post("/user/login", async (req, res) => {
  try {
    const userData = await Users.findOne({ email: req.body.email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(
        req.body.password,
        userData.password
      );
      console.log(userData._id, "this is id");
      if (passwordMatch) {
        const payload = {
          fullname: userData.fullname,
          email: userData.email,
        };
        const token = jwt.sign(payload, "this is secret");
        res.status(200).send({
          success: true,
          accessToken: token,
        });
      } else {
        res.status(401).send({ message: "Password not matched" });
      }
    } else {
      res.status(401).send({ message: "User not Found" });
    }
  } catch (err) {
    res.status(err.status || 500).json({
      status: false,
      response: err.message || "Internal Server Error",
    });
  }
});

//User Update Done
app.post("/user/update", async (req, res) => {
  try {
    /// console.log(req.body.email);
    await Users.findOneAndUpdate(
      { email: req.body.email },
      {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        phone: req.body.phone,
        country: req.body.country,
        timeZone: req.body.timeZone,
        address: req.body.address,
        deletedAt: req.body.deletedAt,
        businessInfo: req.body.businessInfo,
      }
    ).then((result) => {
      if (result) {
        res.status(200).send({ message: "User Details updated" });
      } else {
        res.status(200).send({ message: "User Not Found" });
      }
    });
  } catch (err) {
    res.status(err.status || 500).json({
      status: false,
      response: err.message || "Internal Server Error",
    });
  }
});

//Check Email Done
app.post("/user/check-email", async (req, res) => {
  try {
    const userData = await Users.findOne({ email: req.body.email });
    if (userData) {
      res.status(200).send({ message: "email already exist" });
    } else {
      res.status(200).send({ message: "email available" });
    }
  } catch (err) {
    res.status(err.status || 500).json({
      status: false,
      response: err.message || "Internal Server Error",
    });
  }
});

//reset Password Done
app.post("/user/resetPassword", async (req, res) => {
  try {
    const hasPassword = await bcrypt.hash(req.body.password, 10);
    const userData = await Users.findOneAndUpdate(
      { email: req.body.email },
      { password: hasPassword },
      { new: true }
    );
    if (userData) {
      res.status(200).send({
        status: true,
        message: "SuccessFully Reset ",
      });
    } else {
      res.status(200).send({
        status: false,
        message: "User Not Found !!",
      });
    }
  } catch (err) {
    res.status(err.status || 500).json({
      status: false,
      response: err.message || "Internal Server Error",
    });
  }
});

//Change Password Done
app.post("/user/change-password", async (req, res) => {
  try {
    const hasPassword = await bcrypt.hash(req.body.newPassword, 10);
    const userData = await Users.find({ email: req.body.email });
    bcrypt.compare(
      req.body.oldpassword,
      userData[0].password,
      async function (err, result) {
        if (err) {
          console.error("Error comparing passwords:", err);
        } else if (result) {
          const userData = await Users.findOneAndUpdate(
            { email: req.body.email },
            { password: hasPassword },
            { new: true }
          );
          if (userData) {
            res.status(200).send({
              message: "Password Changed",
            });
          } else {
            res.status(401).send({ message: "User not Found" });
          }
        } else {
          res.status(200).send({
            message: "Password do not match.",
          });
        }
      }
    );

    // res.status(200).send({
    //   message: "SuccessFully Reset ",
    // });
  } catch (err) {
    res.status(err.status || 500).json({
      status: false,
      response: err.message || "Internal Server Error",
    });
  }
});

//change Email Done
app.post("/user/change-email", async (req, res) => {
  try {
    const userData = await Users.findOneAndUpdate(
      { email: req.body.email },
      { email: req.body.newEmail }
    );
    if (userData) {
      res.status(200).send({
        message: "SuccessFully Email Changed ",
      });
    } else {
      res.status(401).send({ message: "User not Found" });
    }
  } catch (err) {
    res.status(err.status || 500).json({
      status: false,
      response: err.message || "Internal Server Error",
    });
  }
});

//get bot details Done
app.post("/user/get-user-data", async (req, res) => {
  try {
    ///const tokenData = jwt.decode(req.body.token);
    const userData = await Users.findOne({ email: req.body.email });
    if (userData) {
      res.status(200).send({
        user: {
          id: userData._id,
          firstname: userData.firstname,
          lastname: userData.lastname,
          email: userData.email,
          phone: userData.phone,
          country: userData.country,
          address: userData.address,
          timeZone: userData.timeZone,
          businessInfo: userData.businessInfo,
          deletedAt: userData.deletedAt,
        },
        status: true,
      });
    } else {
      res.status(401).send({ message: "User not Found" });
    }
  } catch (err) {
    res.status(err.status || 500).json({
      status: false,
      response: err.message || "Internal Server Error",
    });
  }
});

//Save Bot Data Done
app.post("/bot-data", async (req, res) => {
  try {
    const botsInstance = new Bots({
      userId: req.body.userId,
      details: req.body.details,
      bot_settings: req.body.bot_settings,
      status: req.body.status,
    });
    const response = await botsInstance.save();
    res
      .status(200)
      .send({ success: true, message: "Bots Details Stored", id: response.id });
  } catch (err) {
    console.log("failed");
    res.status(err.status || 500).json({
      status: false,
      response: err.message || "Internal Server Error",
    });
  }
});

//update bot details Done
app.post("/update-bot-details", async (req, res) => {
  try {
    await Bots.findByIdAndUpdate(
      { _id: req.body.id },
      {
        status: req.body.status,
        bot_settings: req.body.bot_settings,
        details: req.body.details,
      }
    ).then((r) => {
      if (r) {
        res.status(200).send({ message: "Bot status updated" });
      } else {
        res.status(500).send({ message: "Bot not found " });
      }
    });
    // console.log(userData);
  } catch (err) {
    res.status(err.status || 500).json({
      status: false,
      response: err.message || "Internal Server Error",
    });
  }
});

//Get Bot Data Done
app.get("/bot-data/:id", async (req, res) => {
  try {
    const botsInstance = await Bots.find({ userId: req.params.id });
    if (botsInstance) {
      res.status(200).json(botsInstance);
    } else {
      res.status(404).json({ message: "Data not found" });
    }
    //res.status(200).send({ success: true, data: botsInstance });
  } catch (err) {
    console.log("failed");
    res.status(err.status || 500).json({
      status: false,
      response: err.message || "Internal Server Error",
    });
  }
});

// Buy Phone Number from Twilio Done
app.post("/buyNumber", (req, res) => {
  try {
    client
      .availablePhoneNumbers(req.body.ISO)
      .fetch()
      .then(async (available) => {
        console.log(available.subresourceUris.local);
        await axios
          .get(`https://api.twilio.com${available.subresourceUris.local}`, {
            auth: {
              username: accountSid,
              password: authToken,
            },
          })
          .then((numbers) => {
            let allavailableNumbers = numbers.data.available_phone_numbers;
            let indexofNumber = Math.floor(
              Math.random() * (allavailableNumbers.length - 0 + 1) + 0
            );
            client.incomingPhoneNumbers
              .create({
                phoneNumber: allavailableNumbers[indexofNumber]?.phone_number,
              })
              .then((incoming_phone_number) => {
                res.status(200).send({
                  SelectedNumberData: incoming_phone_number,
                  status: true,
                  message: "Done",
                });
                //console.log(incoming_phone_number, "done")
              })
              .catch((e) => {
                console.log("create Error", e);
              });
            //console.log(allavailableNumbers);
          })
          .catch((err) => {
            console.log(err);
          });
      });
  } catch (err) {
    console.log(err);
    res.status(err.status || 500).json({
      status: false,
      response: err.message || "Internal Server Error",
    });
  }
});

//Update Phone Number Done
app.post("/update-phone-number", (req, res) => {
  try {
    client
      .incomingPhoneNumbers(req.body.phoneSid)
      .update({ voiceUrl: req.body.webhookUrl })
      .then((incoming_phone_number) => {
        console.log(incoming_phone_number.friendlyName);
        res.status(200).send({
          updatePhoneNumber: incoming_phone_number,
          status: true,
          message: "Done",
        });
      });
  } catch (err) {
    console.log(err);
    res.status(err.status || 500).json({
      status: false,
      response: err.message || "Internal Server Error",
    });
  }
});

//Release Phone Number Done
app.post("/release-phone-number", async (req, res) => {
  try {
    //console.log(req.body.phoneSid);
    await axios
      .delete(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers/${req.body.phoneSid}.json`,
        {
          auth: {
            username: accountSid,
            password: authToken,
          },
        }
      )
      .then((r) => {
        console.log(r, "result");
        res.status(200).json({
          status: true,
          message: `Phone SID : ${req.body.phoneSid} is Released`,
        });
      })
      .catch((err) => {
        console.log(err, "error");
      });
  } catch (err) {
    console.log("failed");
    res.status(err.status || 500).json({
      status: false,
      response: err.message || "Internal Server Error",
    });
  }
});

// setInterval(() => {
//   console.log("API call");
// }, 1000);

app.listen(PORT, () => {
  console.log(`APP is running on ${PORT}`);
});
