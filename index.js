import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

db.connect();

async function getItems(){
  let items = await db.query("select * from items")
  return items.rows;
}

app.get("/", async (req, res) => {
  let items = await getItems();
  console.log("the items are: " + items);
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  await db.query("insert into items (title) values ($1)", [item]);
  res.redirect("/");
});

app.post("/edit", async(req, res) => {
  const oldId = req.body.updatedItemId;
  const newTitle = req.body.updatedItemTitle;
  await db.query("update items set title = ($1) where id = ($2)", [newTitle, oldId]);
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  await db.query("delete from items where id = ($1)", [id]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
