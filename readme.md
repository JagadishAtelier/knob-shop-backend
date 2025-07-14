# Knobs Shop Backend API

This is the backend for the **Knobs Shop Ecommerce Platform**, built with **Node.js**, **Express.js**, and **MongoDB** using **Mongoose**. It provides RESTful API endpoints to manage products, categories, users, and orders.

---

## 📦 Project Structure

```

knobsshop\_backend/
├── controllers/
├── models/
├── routes/
├── middleware/
├── config/
├── server.js
├── .env
├── package.json
└── README.md

````

---

## 🚀 Getting Started

### 1. **Clone the Repository**

```bash
git clone https://github.com/Atelier-Creation/knob-shop-Backend.git
cd knobsshop_backend
````

### 2. **Install Dependencies**

```bash
npm install
```

### 3. **Setup Environment Variables**

Create a `.env` file in the root with the following variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/knobsshop
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

### 4. **Run in Development Mode**

Uses `nodemon` for auto-restart on changes:

```bash
npm run dev
```

### 5. **Run in Production Mode**

```bash
npm start
```

### 6. **Build (Install & Start Dev Server)**

```bash
npm run build
```

---

## 📌 API Example: Get Products by Category

**Endpoint:**

```http
GET /api/products/category/:categoryId
```

**Response:**

```json
{
  "success": true,
  "count": 4,
  "data": [ /* product list */ ]
}
```

---

## 🔐 Features

* User Authentication (JWT)
* Product & Category CRUD
* Discount & Variant Management
* Email Notifications (via Nodemailer)
* Data Validation & Sanitization
* Secure Headers using Helmet
* CORS Support
* Request Logging with Morgan

---

## 🧪 Future Enhancements

* Admin Dashboard APIs
* Payment Gateway Integration (Razorpay/Stripe)
* Shipping APIs Integration
* Image & Video Upload (Cloudinary or S3)
* Inventory Management

---

## 👨‍💻 Author

**Prasanth**
On behalf of **Atelier**

---

## 📄 License

This project is licensed under the ISC License.

```