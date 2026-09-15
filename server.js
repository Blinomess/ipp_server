const path = require("path");
const express = require("express");
const mongodb = require("mongodb");
const { ObjectId, MongoClient } = mongodb;

const CONTACTS_COLLECTION = "contacts";
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let db;

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/test";

async function start() {
  try {
    const client = await MongoClient.connect(MONGODB_URI);
    db = client.db();
    console.log("База данных подключена");

    const server = app.listen(process.env.PORT || 8080, () => {
      console.log("Приложение запущено на порту", server.address().port);
    });
  } catch (err) {
    console.error("Ошибка подключения к MongoDB:", err);
    process.exit(1);
  }
}

function handleError(res, reason, message, code) {
  console.log("Ошибка: " + reason);
  res.status(code || 500).json({ error: message });
}

app.get("/v1/contact", async (req, res) => {
  try {
    const docs = await db.collection(CONTACTS_COLLECTION).find({}).toArray();
    res.status(200).json(docs);
  } catch (err) {
    handleError(res, err.message, "Не удалось получить контакты.");
  }
});

app.post("/v1/contact", async (req, res) => {
  const newContact = req.body;
  if (!newContact || !newContact.username || !newContact.email) {
    return handleError(res, "Invalid user input", "Необходимо указать имя и email.", 400);
  }
  try {
    const result = await db.collection(CONTACTS_COLLECTION).insertOne(newContact);
    res.status(201).json({ _id: result.insertedId, ...newContact });
  } catch (err) {
    handleError(res, err.message, "Не удалось создать контакт.");
  }
});

app.delete("/v1/contact", async (req, res) => {
  try {
    const result = await db.collection(CONTACTS_COLLECTION).deleteMany({});
    res.status(200).json(result);
  } catch (err) {
    handleError(res, err.message, "Не удалось удалить контакты.");
  }
});

app.get("/v1/contact/:uid", async (req, res) => {
  try {
    const doc = await db.collection(CONTACTS_COLLECTION).findOne({
      _id: new ObjectId(req.params.uid),
    });
    if (!doc) return handleError(res, "Not found", "Контакт не найден.", 404);
    res.status(200).json(doc);
  } catch (err) {
    handleError(res, err.message, "Не удалось получить контакт.");
  }
});

app.put("/v1/contact/:uid", async (req, res) => {
  const updateDoc = req.body;
  delete updateDoc._id;
  try {
    await db.collection(CONTACTS_COLLECTION).updateOne(
      { _id: new ObjectId(req.params.uid) },
      { $set: updateDoc }
    );
    res.status(200).json({ _id: req.params.uid, ...updateDoc });
  } catch (err) {
    handleError(res, err.message, "Не удалось обновить контакт.");
  }
});

app.delete("/v1/contact/:uid", async (req, res) => {
  try {
    const result = await db.collection(CONTACTS_COLLECTION).deleteOne({
      _id: new ObjectId(req.params.uid),
    });
    res.status(200).json(result);
  } catch (err) {
    handleError(res, err.message, "Не удалось удалить контакт.");
  }
});

start();