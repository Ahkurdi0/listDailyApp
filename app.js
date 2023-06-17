// models 
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require('mongoose');
const _ = require('lodash');




// schema for items collection
const itemSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
const items = [item1, item2, item3];
// end of schema for items collection


// schema for lists collection
const listSchema = new mongoose.Schema({
  name: String,
  arrayList: [itemSchema]
});
const List = mongoose.model("List", listSchema);
// end of schema for lists collection



// Connect to MongoDB with async and await
main().catch(err => console.error(err));
async function main() {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect('mongodb://127.0.0.1:27017/items');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('An error occurred while connecting to MongoDB:', error);
  }
}
// End of Connect to MongoDB


// requirement for ejs and body-parser and mongoose
//ejs requirement
app.set('view engine', 'ejs');
//body-parser
app.use(bodyParser.urlencoded({
  extended: true
}));
//public folder for css
app.use(express.static("public"));
//end of requirement for ejs and body-parser and mongoose




// home route with async and await
app.get("/", async function (req, res) {
  try {

    const items2 = await Item.find().exec();
    if (items2.length === 0) {
      const result = await Item.insertMany(items); // Insert items if the count is 0
      console.log('Items inserted:', result);
    } else {
      console.log("alread inserted ")
    }

    res.render("list", {
      listTitle: "Today",
      newListItems: items2
    });
  } catch (error) {
    console.error(error);
  }
});
// end of home route with async and await




// add new item route with async and await
app.post("/", async function (req, res) {
      const newItem = req.body.newItem;
      const listName = req.body.list;
      const item = new Item({
        name: newItem
      });

      if (listName === "Today") {
       item.save();
       res.redirect("/");
      }
      else {
        List.findOne({name: listName}, function(err, foundList){
          foundList.arrayList.push(item);
          foundList.save();
          res.redirect("/" + listName);
        });
      }
});
    // end of add new item route with async and await



    // delete item route with async and await
    app.post("/delete", async function (req, res) {
      const deleteItem = req.body.myCheckbox; // ID of the selected item
      const listNameHidden = req.body.listNameHidden; // Name of the list
      // console.log(listNameHidden); // Name of the list
      if (listNameHidden === "Today") {
        try {
          const deleteResult = await Item.deleteOne({
            _id: deleteItem
          });
          console.log('Item deleted:', deleteResult);
          res.redirect("/");
        } catch (error) {
          console.error('Error deleting item:', error);
          // Handle the error appropriately
        }
      } else {
        List.findOneAndUpdate({name: listNameHidden}, {$pull: {arrayList: {_id: deleteItem}}}, function(err, foundList){
          if(!err){
            res.redirect("/" + listNameHidden);
          }
        });
      }

  });
    // end of delete item route with async and await



// custom route with async and await
app.get('/:customRoute', function (req, res) {
  const customRoute = _.lowerCase(req.params.customRoute);
  List.findOne({ name: customRoute }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        // Create a new list
        const list = new List({
          name: customRoute,
          arrayList: items
        });
        list.save();
        res.redirect("/" + customRoute);
      } else {
        // Show an existing list
        res.render("list", {
          listTitle: customRoute,
          newListItems: foundList.arrayList
        });
      }
    }
  });
});
// end of custom route with async and await





    // about route
    app.get("/about", function (req, res) {
      res.render("about");
    });
    // end of about route


    // server port
    app.listen(3000, function () {
      console.log("Server started on port 3000");
    });
    // end of server port