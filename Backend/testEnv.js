require("dotenv").config();

console.log(process.env.OPENAI_API_KEY);
console.log("MONGO:", process.env.MONGO_URI);