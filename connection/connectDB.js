const mongoose =  require("mongoose")
const dotenv  =  require("dotenv")
dotenv.config()

mongoose.connect(process.env.DB_URL).then(() => {
    console.log("Database is connected!!");
  })
  .catch((err) =>
    console.log(
      `Database can't be connected due to following reason:\n${err.message}`
    )
  );