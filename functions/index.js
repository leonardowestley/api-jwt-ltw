import functions from "firebase-functions";
import express, { response } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import mySecretKey from "./secret.js";

const users = [
  { id: 1, email: "todd@bocacode.com", password: "abc123" },
  { id: 1, email: "damian@bocacode.com", password: "def456" },
  { id: 1, email: "vitoria@bocacode.com", password: "ghi789" },
];

const app = express();
app.use(cors());
app.use(express.json());

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  // check to see if that email and password exist in oudb
  // if they do, create and send back a token
  // if they don't, send back an error message
  let user = users.find(
    (user) => user.email === email && user.password === password
  );
  if (!user) {
    res.status(401).send({ error: "Invalid email or password" });
    return;
  }
  user.password = undefined; // remove password from the user object
  // now we want to sign / create a token...
  const token = jwt.sign(user, mySecretKey, { expiresIn: "1d" });
  res.send({ token });
});

app.get("/public", (req, res) => {});
app.post("/private", (req, res) => {});
app.post("/welcome", (req, res) => {});

app.get("/private", (req, res) => {
  // let's require a valid token to see this
  const token = req.headers.authorization || "";
  if (!token) {
    res.status(401).send({ error: "You must be logged in to see this" });
    return;
  }
  jwt.verify(token, mySecretKey, (err, decoded) => {
    if (err) {
      res.status(401).send({ error: "You must be logged in to see this" });
      return;
    }
    // here we know that the token is valid...
    res.send(`Welcome ${decoded.email}!`);
  });
});

export const api = functions.https.onRequest(app);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
