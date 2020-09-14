const express = require("express");
const app = express();
const port = 3000;
const mysql = require("promise-mysql");
const Basket = require("./data/basket");
const baskets = [];
const cookieparser = require("cookie-parser");

app.use(cookieparser());
app.use(express.static("public"));
app.set("view engine", "pug");

var connection;

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
  // Display basket in top right
  let inventory;
  connection
    .query("SELECT * FROM inventory")
    .then((results) => {
      inventory = results;
      if (req.cookies.basketId) {
        return connection.query(
          `SELECT * FROM shopping WHERE basketid='${req.cookies.basketId}'`
        );
      }
    })
    .then((results) => {
      // results is now the basket items, or is empty
      res.render("stock", { inventory, basket: results });
    })
    .catch((error) => {
      return res.render("error", { error: error.message });
    });
});

app.get("/basket/add/:sku", (req, res) => {
  const sku = req.params.sku;
  // first find the item in the database that matches the sku of the item clicked
  connection
    .query(`SELECT * FROM inventory WHERE sku='${sku}'`)
    .then((results) => {
      // If the item is out of stock
      if (results.length !== 1) {
        throw new Error("That item does not exist");
      }
      // now that we have one result, let's call it by its name (it's an item) by selecting it from the array
      const item = results[0];
      // find the existing basket id of the shopper, or make one if this is their first basket
      const basketId = req.cookies.basketId || Date.now().toString();
      res.cookie("basketId", basketId);
      // Add this item to the basket with the matching basket id
      return connection.query(
        `INSERT INTO shopping (sku, basketid) VALUES('${item.sku}', '${basketId}')`
      );
    })
    .then(() => {
      // now take them back to the stock page after the item is added
      res.redirect("/stock");
    })
    .catch((error) => {
      return res.render("error", { error: error.message });
    });
  // const item = stock.inventory.find((item) => item.sku === sku);
  // if (item.stock < 1) {
  //   res.render("error", { error: "item out of stock" });
  // }
  // item.stock--;
  // // A user we have seen before
  // let basket = baskets.find(
  //   (basket) => basket.shopperId === req.cookies.shopperId
  // );
  // console.log(basket, req.cookies.shopperId);
  // // A user that we have never seen before
  // if (!basket) {
  //   const shopperId = Date.now();
  //   basket = new Basket(shopperId.toString());
  //   baskets.push(basket);
  // }
  // basket.addItemToBasket(item);
  // res.redirect("/stock");
});

mysql
  .createConnection({
    host: "localhost",
    user: "dazdaUser",
    password: "mypassword",
    database: "horses",
  })
  .then((_connection) => {
    connection = _connection;
    console.log("Succesfully connected to Database");
  })
  .catch((error) => {
    console.error("Could not connect to Database", error);
  });

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
