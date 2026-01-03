import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();


app.listen(process.env.PORT,"0.0.0.0", () => {
  console.log("Backend running on port",process.env.PORT);
});
