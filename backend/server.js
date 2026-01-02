import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();


app.listen(4000, () => {
  console.log("Backend running on port 4000");
});
