# HandyIllinois

HandyIllinois is a platform connecting residents of Illinois with local service providers (e.g., repair technicians, cleaners, movers) for hassle-free task management. This repository contains the full-stack codebase, with the backend hosted on **Google App Engine**.

---

## Features

- User registration and role-based access (clients vs. service providers)
- Post service requests with details, location, and budget
- Browse and filter services by category, ratings, or proximity
- Booking system with real-time status updates
- Review and rating system for completed services
- Responsive design for all devices

---

## Technologies Used

### Frontend
- **React**: Dynamic UI components and state management.
- **React Router**: Seamless client-side navigation.
- **Axios**: HTTP requests to the backend API.
- **Chakra UI**/**Tailwind CSS**: Modern styling and responsive layouts.

### Backend
- **Node.js**: Server-side runtime environment.
- **Express.js**: RESTful API development.
- **MongoDB**: Database for storing users, services, and transactions.
- **Mongoose**: Schema modeling and database interactions.
- **Google App Engine**: Cloud-based backend deployment.
- **Mysql server**: Google cloud based Mysql server
- **JWT**: Secure user authentication and authorization.

### Additional Tools
- **Git**: Version control and collaboration.
- **Postman**: API documentation and testing.

---

## Deployment Details

### Backend (Google App Engine)
- The Node.js/Express API is deployed on Google App Engine for scalability.
- Configure environment variables in `app.yaml` (MongoDB URI, JWT secret, etc.).
- **API Base URL**: `https://[YOUR_APP_ENGINE_PROJECT_ID].uc.r.appspot.com`

### Frontend (Gitlab Pages)
- Yet to be hosted on Gitlab pages

---

## Installation

### Prerequisites
- Node.js (v18+)
- npm or yarn
- MongoDB Atlas cluster or local instance

### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Venkateshkamat/HandyIllinois.git
   cd HandyIllinois/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=3001
   (DATBASE DETAILS)
   ```
4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the API endpoint in `.env`:
   ```env
   REACT_APP_API_URL=http://localhost:3001
   BACKEND_URL="{YOUR GOOGLE APP ENGINE URL}"
   ```
4. Run the development server:
   ```bash
   npm start
   ```

---

## Contributing

Contributions are welcome! Follow these steps:
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit changes: `git commit -m 'Add your feature'`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a pull request.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

**HandyIllinois** · [GitHub Repository](https://github.com/Venkateshkamat/HandyIllinois)