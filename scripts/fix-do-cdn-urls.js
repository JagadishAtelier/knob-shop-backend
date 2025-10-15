require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");

function fixUrl(url) {
  if (!url || typeof url !== "string") return url;
  return url.replace(
    "blr1.digitaloceanspaces.com",
    "blr1.cdn.digitaloceanspaces.com"
  );
}

async function runFix() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("✅ Connected to MongoDB");

  // ---- CATEGORY FIX ----
  const categories = await Category.find({});
  console.log(`Found ${categories.length} categories`);
  for (const category of categories) {
    if (category.categoryImageUrl) {
      const fixed = fixUrl(category.categoryImageUrl);
      if (fixed !== category.categoryImageUrl) {
        category.categoryImageUrl = fixed;
        await category.save();
      }
    }
  }
  console.log("✅ Categories updated");

  // ---- PRODUCT FIX ----
  const products = await Product.find({});
  const totalProducts = products.length;
  console.log(`Found ${totalProducts} products`);
  let updatedCount = 0;

  for (const product of products) {
    let modified = false;

    // ✅ Default hsncode if missing
    if (!product.hsncode) {
      product.hsncode = "123";
      modified = true;
    }

    // Main images
    if (Array.isArray(product.images)) {
      const newImages = product.images.map((img) => fixUrl(img));
      if (JSON.stringify(newImages) !== JSON.stringify(product.images)) {
        product.images = newImages;
        modified = true;
      }
    }

    // Brochure
    if (product.brochure) {
      const fixed = fixUrl(product.brochure);
      if (fixed !== product.brochure) {
        product.brochure = fixed;
        modified = true;
      }
    }

    // Installation video
    if (product.installation?.videoUrl) {
      const fixed = fixUrl(product.installation.videoUrl);
      if (fixed !== product.installation.videoUrl) {
        product.installation.videoUrl = fixed;
        modified = true;
      }
    }

    // Features images
    if (Array.isArray(product.features)) {
      product.features = product.features.map((feature) => {
        if (feature.image) {
          const fixed = fixUrl(feature.image);
          if (fixed !== feature.image) {
            feature.image = fixed;
            modified = true;
          }
        }
        return feature;
      });
    }

    // Variant images
    if (Array.isArray(product.variant)) {
      for (const variant of product.variant) {
        if (Array.isArray(variant.images)) {
          variant.images = variant.images.map((vimg) => {
            if (vimg.url) {
              const fixed = fixUrl(vimg.url);
              if (fixed !== vimg.url) {
                vimg.url = fixed;
                modified = true;
              }
            }
            return vimg;
          });
        }
      }
    }

    // Save if any field changed
    if (modified) {
      try {
        await product.save();
        updatedCount++;
        console.log(`✅ Updated product: ${product.name}`);
      } catch (err) {
        console.warn(`⚠️ Failed to update ${product.name}: ${err.message}`);
      }
    }
  }

  console.log(`🎉 Done. Updated ${updatedCount} products out of ${totalProducts}.`);
  await mongoose.disconnect();
}

runFix().catch(console.error);
