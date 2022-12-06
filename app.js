//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

// let items = ["Buy car", "Drive car", "Eat Food"];
var workItems = [];

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://admin-jorden:test123@cluster0.wmdxiu3.mongodb.net/todolistDB", {
  useNewUrlParser: true
});

const itemSchema = {
  name: String
};
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "buy"
});
const item2 = new Item({
  name: "eat"
});
const item3 = new Item({
  name: "lift"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema)

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Success");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }

  })


});

// app.get("/", function(req, res) {
//   var today = new Date();
//   var currentDay = today.getDay();
//   var day = "";
//   if (today.getDay() === 6 || currentDay === 0) {
//     day = new Intl.DateTimeFormat('en-US', {
//       weekday: 'long'
//     }).format(today);
//   } else {
//     day = new Intl.DateTimeFormat('en-US', {
//       weekday: 'long'
//     }).format(today);
//   }

//   res.render("list", {
//     listTitle: day,
//     newListItems: items
//   });
//
// });

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {

    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("Removed from list");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }


});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        })
      }
    }
  });

});

app.post("/work", function(req, res) {
  let item = req.body.new;
  workItems.push(item);
  res.redirect("/work");
});

app.get("/about", function(req, res) {
  res.render("about");
})

app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
