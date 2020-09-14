const express = require("express");
const app = express();
const port = 3000;
const mysql = require("mysql");
const Basket = require("./data/basket");
const baskets = [];
const cookieparser = require("cookie-parser");

app.use(cookieparser());
app.use(express.static("public"));
app.set("view engine", "pug");

var connection = mysql.createConnection({
  host: "localhost",
  user: "dazdaUser",
  password: "mypassword",
  database: "horses",
});

app.get("/test", (req, res) => {
  connection.query("SELECT * FROM inventory", (error, results) => {
    if (error) {
      console.log("problem with query", error);
      return;
    }
    res.send(results);
  });
});

app.get("/", (req, res) => {
  let basket = baskets.find(
    (basket) => basket.shopperId === req.cookies.shopperId
  );
  res.render("home", { basket });
});

app.get("/stock", (req, res) => {
  let basket = baskets.find(
    (basket) => basket.shopperId === req.cookies.shopperId
  );

  connection.query("SELECT * FROM inventory", (error, results) => {
    if (error) {
      console.log("problem with query", error);
      return;
    }
    res.render("stock", { inventory: results, basket });
  });
});

app.get("/basket/add/:sku", (req, res) => {
  const sku = req.params.sku;
  const item = stock.inventory.find((item) => item.sku === sku);
  if (item.stock < 1) {
    res.render("error", { error: "item out of stock" });
  }
  // A user we have seen before
  let basket = baskets.find(
    (basket) => basket.shopperId === req.cookies.shopperId
  );
  console.log(basket, req.cookies.shopperId);
  // A user that we have never seen before
  if (!basket) {
    const shopperId = Date.now();
    basket = new Basket(shopperId.toString());
    baskets.push(basket);
    res.cookie("shopperId", basket.shopperId);
  }
  basket.addItemToBasket(item);
  res.redirect("/stock");
});

connection.connect((err) => {
  if (err) {
    console.log("error connecting to Database", err);
    return;
  }
  console.log("Succesfully connected to Database");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
