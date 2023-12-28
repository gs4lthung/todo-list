import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "todolist",
  password: "1am4tien1hunG2#",
  port: 5432,
});
db.connect();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [];

app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM items ORDER BY id ASC");
    items = result.rows;
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });
  } catch (err) {
    console.log(err);
  }
});
app.post("/add", async(req, res) => {
  const newTask = req.body.newItem;

  const currentDate = new Date();
  const month = currentDate.getMonth();
  const day = currentDate.getDate();
  const newDate = `${day}-${month}`;
  items.push({ id: items.length + 1, task: newTask, date: newDate });
  try{
    await db.query("INSERT INTO items(task, date) VALUES($1, $2)", [newTask, newDate]);
  }
  catch(err){
    console.log(err);
  }
  res.redirect("/");
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
