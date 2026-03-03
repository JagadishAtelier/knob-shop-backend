require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");
const Category = require("./models/Category");

async function checkSubpage() {
    await mongoose.connect(process.env.MONGO_URI);
    const categories = await Category.find({}, "category_name subpageType");
    console.log("Categories:", categories);
    process.exit(0);
}
checkSubpage();
