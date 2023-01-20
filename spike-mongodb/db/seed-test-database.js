// This spike will show off using mongoose with MongoDB Atlas

// First we require in our stuff
const mongoose = require("mongoose");
const Scientist = require("./scientists");
const scientistData = require("./data/scientists.json");

// Then we connect to our database
// This first parameter is the connection string, not sure how to obfuscate this so that randos can't login though
// The second parameter is a callback for when mongoose connects successfully
// The third parameter is a callback for when mongoose fails to connect
mongoose.connect(
  "mongodb+srv://stormytuna:ayanami@test.cpnpkbx.mongodb.net/test",
  () => {
    console.log("Successfully connected!");
  },
  (e) => {
    console.log("Failed to connect");
    console.error(e.message);
  }
);

// We're using async await syntax here to make it a bit more readable
async function seed() {
  try {
    // Delete all of our current data so we can reseed
    await Scientist.deleteMany({});

    // Now, we can add in all of our data
    await Scientist.insertMany(scientistData);
  } catch (e) {
    console.error(e.message);
  }
}

run();
async function run() {
  await seed();
  // Feel free to uncomment any of these to see what stuff is printed to the console
  // await findAllScientists();
  // await findOldestScientist();
  // await addScientistAccomplishments();
}

async function findAllScientists() {
  try {
    // Note the empty object we pass into find here
    // The object we pass here is the query, an empty query just means find anything
    const scientists = await Scientist.find({});
    console.log(scientists);
  } catch (e) {
    console.error(e.message);
  }
}

async function findOldestScientist() {
  try {
    // Here we make use of the .sort method that lets us sort by a given prop
    const scientists = await Scientist.find({}).sort({ "dateOfBirth": 1 }).limit(1);
    console.log(scientists);
  } catch (e) {
    console.error(e.message);
  }
}

async function addScientistAccomplishments() {
  try {
    // Here we add something to the famousFor prop on our scientists
    const einstein = await Scientist.findOneAndUpdate({ lastName: { $eq: "Einstein" } }, { $push: { famousFor: "Special relativity" } });
    // The first object we pass is our query, this is how we find our database item
    // The second object we pass is how we want to update our item, in this case using the $push operator to push "Special relativity" onto the famousFor prop
  } catch (e) {}
}
