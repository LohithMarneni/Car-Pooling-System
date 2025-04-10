# 🚗 MERN Stack Carpooling System

A full-stack web application that enables users to offer and join carpool rides. The system supports both **Drivers** and **Riders** with role-based features and real-time interaction.

## 📌 Features

### 🔐 Authentication

- User registration and login using JWT
- Role-based access control (`driver` or `rider`)
- Protected routes with token validation middleware

### 👤 User Profiles

- Store user preferences, emergency contacts, and tokens
- Secure profile data with privacy features

### 🚘 Driver Features

- Create, edit, delete rides
- View ride history
- View and manage incoming ride requests (approve/reject)
- Vehicle details and preferences included during ride creation

### 🧍 Rider Features

- Search available rides based on **pickup**, **drop**, and **date**
- Request to join rides
- View status of ride requests (pending/approved/rejected)

### 📍 Ride Matching & Management

- Intelligent ride matching based on locations and time
- Prevents duplicate or unauthorized requests
- Handles available seat count and request lifecycle

### 🔐 Privacy & Safety

- Emergency contacts stored per user
- Optional phone number masking
- Request approval system ensures driver control

---

## 🛠️ Tech Stack

### Frontend

- **React.js**
- **Axios** for API calls
- **React Router** for navigation
- **Tailwind CSS** for styling

### Backend

- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose**
- **JWT** for secure authentication
- **Bcrypt.js** for password hashing

---

## ⚙️ Getting Started

### Prerequisites

- Node.js and npm
- MongoDB instance (local or cloud)
- React and Vite or CRA for frontend

### Setup

#### 1. Backend Setup

```bash
cd backend
npm install
```

- Create a `.env` file and add:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
ACCESS_TOKEN_SECRET=your_jwt_access_token_secret
REFRESH_TOKEN_SECRET=your_jwt_refresh_token_secret
```

- Start the backend server:

```bash
npm run dev
```

#### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 📂 Folder Structure

```bash
/backend
  ├── controllers/
  ├── models/
  ├── routes/
  ├── middleware/
  └── server.js

/frontend
  ├── components/
  ├── context/
  └── main.jsx
```

---

## ✅ Future Improvements

- SOS alert and live location sharing
- Real-time ride updates using WebSockets
- Push notifications for approvals and messages
- Google Maps API for route accuracy
- WhatsApp/email invite sharing for rides

---

## 👨‍💻 Author

**Lohith Marneni - AP22110011121**  
BTech, SRM University-AP  
Contact:  
[LinkedIn](https://www.linkedin.com/in/lohithmarneni)  
[GitHub](https://github.com/lohithmarneni)

---

## 📝 License

This project is submission of assignment for MoveInSync drive.
