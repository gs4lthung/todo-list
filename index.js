import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3001;
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
    if (items.length === 0) {
      await db.query("ALTER SEQUENCE items_id_seq RESTART WITH 1");
    }
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
app.post("/add", async (req, res) => {
  const newTask = req.body.newItem;
  if (newTask === "") {
    res.redirect("/");
    return;
  }
  const currentDate = new Date();
  const month = currentDate.getMonth();
  const day = currentDate.getDate();
  const newDate = `${day}-${month}`;

  const newStatus = false;

  items.push({ task: newTask, date: newDate, status: newStatus });
  try {
    await db.query("INSERT INTO items(task, date, status) VALUES($1, $2, $3)", [
      newTask,
      newDate,
      newStatus,
    ]);
  } catch (err) {
    console.log(err);
  }
  res.redirect("/");
});
app.post("/edit", async (req, res) => {
  console.log(req.body.editedTask);
  const editedTask = req.body.editedTask;
  const editedId = req.body.editedId;
  try {
    const current = await db.query("SELECT * FROM items WHERE id = $1", [
      editedId,
    ]);
    if (current.rows.length > 0) {
      const currentTask = current.rows[0].task;
      if (currentTask !== editedTask) {
        await db.query("UPDATE items SET task = $1 WHERE id = $2", [
          editedTask,
          editedId,
        ]);
        res.redirect("/");
      }
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/delete", async (req, res) => {
  const id = req.body.deletedId;
  try {
    await db.query("DELETE FROM items WHERE id = $1", [id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
