# SpotOn

## Smart Meetup Recommendation System

SpotOn is a full-stack web application designed to help users discover meetups and activities based on their interests.

The platform allows users to explore meetups, manage their interests, interact with other users, send messages, receive notifications, and manage their profiles.

---

## Features

- User registration and login
- User authentication
- Interest selection and management
- Meetup discovery
- Personalized meetup recommendations
- Meetup details and management
- Meetup history
- User profiles
- Messaging between users
- Notifications
- Places and categories
- Admin dashboard and management

---

## Technologies

### Frontend

- React
- JavaScript
- HTML
- CSS
- Tailwind CSS

### Backend

- Node.js
- Express.js

### Database

- MongoDB

### Other Technologies

- Firebase
- Cloudinary

---

## Project Architecture

SpotOn consists of a frontend application and a backend API.

### Frontend

The frontend is developed using React and provides the user interface for interacting with the platform.

### Backend

The backend is developed using Node.js and Express.js and provides APIs for authentication, users, meetups, messages, notifications, places, and other application functionality.

### Database

MongoDB is used to store application data including users, meetups, messages, notifications, categories, and places.

### Firebase

Firebase is used for authentication and related application services.

### Cloudinary

Cloudinary is used for managing uploaded images and media.

---

## Project Structure

```text
SpotOn
│
├── Frontend
│   ├── src
│   │   ├── ActivityPage.js
│   │   ├── AdminPage.jsx
│   │   ├── Home.js
│   │   ├── Interests.js
│   │   ├── LoginPage.js
│   │   ├── MeetupHistory.js
│   │   ├── MeetupPage.js
│   │   ├── Navbar.js
│   │   ├── Profile.js
│   │   ├── ProtectedRoute.js
│   │   └── Signup.js
│   │
│   └── package.json
│
└── Backend
    ├── middleware
    ├── models
    │   ├── Category.js
    │   ├── Meetup.js
    │   ├── Message.js
    │   ├── Notification.js
    │   ├── Place.js
    │   └── User.js
    │
    ├── routes
    │   ├── aiRoutes.js
    │   ├── authRoutes.js
    │   ├── categoryRoutes.js
    │   ├── meetupRoutes.js
    │   ├── messageRoutes.js
    │   ├── notificationRoutes.js
    │   ├── placeRoutes.js
    │   └── userRoutes.js
    │
    └── server.js

---

## Getting Started

### Frontend

```bash
git clone https://github.com/Tamara-Qwaider/graduation-project.git
cd graduation-project
npm install
npm start
```

---

### Backend

The backend is available in a separate repository:

https://github.com/Tamara-Qwaider/spots-backend

```bash
git clone https://github.com/Tamara-Qwaider/spots-backend.git
cd spots-backend
npm install
node server.js
```

---

## Environment Variables

Sensitive configuration such as database credentials, API keys, and service credentials should be stored in environment variables.

Create a `.env` file locally in the backend project and configure the required environment variables.

For security reasons:

- Do not upload `.env` files to GitHub.
- Do not expose database credentials.
- Do not expose private API keys or service secrets.

---

## Author

**Tamara Qwaider**

Software Engineering Graduate – Al-Zaytoonah University of Jordan

**GitHub:**  
https://github.com/Tamara-Qwaider

**Email:**  
tamarah.q2004@gmail.com

---

## Graduation Project

SpotOn was developed as a university graduation project in 2026.
