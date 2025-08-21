// migrate-urls.js

require("dotenv").config();
const mongoose = require("mongoose");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fetch = require("node-fetch");
const Product = require("../models/Product");
const Category = require("../models/Category"); // Assuming you have a Category model

// --- AWS SDK v3 Configuration ---
const s3 = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: process.env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
});

const bucketName = process.env.DO_SPACES_BUCKET;

// --- Helper Function to Download and Upload ---
// Updated migrateFile function
async function migrateFile(url) {
  if (!url || !url.startsWith("https://res.cloudinary.com")) {
    return url;
  }
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to download file from URL: ${url}`);
      return url;
    }
    
    // Read the entire stream into a buffer before uploading
    const fileBuffer = await response.arrayBuffer();
    const filename = url.split("/").pop();
    const fileKey = `uploads/${filename}`;
    
    const uploadParams = {
      Bucket: bucketName,
      Key: fileKey,
      Body: Buffer.from(fileBuffer), // Convert ArrayBuffer to a Node.js Buffer
      ACL: "public-read",
    };
    
    await s3.send(new PutObjectCommand(uploadParams));
    
    const newUrl = `https://${bucketName}.${process.env.DO_SPACES_REGION}.digitaloceanspaces.com/${fileKey}`;
    console.log(`Migrated ${url} to ${newUrl}`);
    return newUrl;
  } catch (error) {
    console.error(`Error migrating file from ${url}:`, error);
    return url;
  }
}

// --- Main Migration Function ---
async function runMigration() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to MongoDB...");
  
  // --- Migrate Category URLs ---
  const categories = await Category.find({});
  for (const category of categories) {
    if (category.categoryImageUrl) {
      category.categoryImageUrl = await migrateFile(category.categoryImageUrl);
    }
    await category.save();
  }

  // --- Migrate Product URLs ---
  const products = await Product.find({});
  
  // Initialize tracking variables here, after fetching products
  const totalProducts = products.length;
  let migratedCount = 0;
  const startTime = Date.now();

  console.log(`Found ${totalProducts} products to migrate.`);

  for (const product of products) {
    
    // Migrate main images
    if (product.images.length > 0) {
      const newImageUrls = [];
      for (const imageUrl of product.images) {
        newImageUrls.push(await migrateFile(imageUrl));
      }
      product.images = newImageUrls;
    }
    
    // Migrate brochure
    product.brochure = await migrateFile(product.brochure);
    
    // Migrate installation video (if applicable)
    if (product.installation && product.installation.videoUrl) {
      product.installation.videoUrl = await migrateFile(product.installation.videoUrl);
    }
    
    // Migrate features images
    if (product.features && product.features.length > 0) {
      for (const feature of product.features) {
        feature.image = await migrateFile(feature.image);
      }
    }
    
    // Migrate variant images
    if (product.variant && product.variant.length > 0) {
      for (const variant of product.variant) {
        if (variant.images && variant.images.length > 0) {
          const newVariantImageUrls = [];
          for (const variantImage of variant.images) {
            variantImage.url = await migrateFile(variantImage.url);
            newVariantImageUrls.push(variantImage);
          }
          variant.images = newVariantImageUrls;
        }
      }
    }
    
    // Save the updated product to the database
    await product.save();
    
    // Update and log progress
    migratedCount++;
    const elapsedTime = (Date.now() - startTime) / 1000; // in seconds
    const avgTimePerProduct = elapsedTime / migratedCount;
    const remainingProducts = totalProducts - migratedCount;
    const estimatedTimeRemaining = remainingProducts * avgTimePerProduct;
    
    console.log(`Product "${product.name}" migrated successfully.`);
    console.log(`Progress: ${migratedCount}/${totalProducts} | ` + 
                `Elapsed: ${elapsedTime.toFixed(2)}s | ` +
                `ETA: ${estimatedTimeRemaining.toFixed(2)}s`);
  }

  const endTime = Date.now();
  const totalTime = (endTime - startTime) / 1000;
  
  console.log("Migration complete!");
  console.log(`Total time taken: ${totalTime.toFixed(2)} seconds.`);
  mongoose.disconnect();
}

runMigration().catch(console.error);