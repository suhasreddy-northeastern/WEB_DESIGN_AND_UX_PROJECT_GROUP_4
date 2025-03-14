# WEB DESIGN AND UX PROJECT GROUP 4

This project is a web application built using **React**, **Node.js**, and **MongoDB**. It is designed for managing the backend and frontend of a web app, with concurrent running and MongoDB for data storage.

## Getting Started

Follow these steps to get your local development environment up and running.

### Prerequisites

* Node.js (v16 or later)
* npm (Node Package Manager)
* MongoDB Atlas account for database hosting (or local MongoDB installation)
* Git (for version control)

### Setting up the Backend

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/suhasreddy-northeastern/WEB_DESIGN_AND_UX_PROJECT_GROUP_4.git
   ```

2. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

3. **Install the dependencies**:
   ```bash
   npm install
   ```

4. **Create a `.env` file** in the `backend` folder (you can use `.env.example` as a reference) and add your MongoDB URI and other necessary environment variables:
   ```
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority
   PORT=5001
   ```
   Replace `<username>`, `<password>`, and `<dbname>` with your MongoDB Atlas credentials and database name.

5. **Start the server**:
   ```bash
   npm run dev
   ```
   This will run the backend on **http://localhost:5001** (or the port you specified).

### Setting up the Frontend

1. **Navigate to the frontend directory**:
   ```bash
   cd ../frontend
   ```

2. **Install the dependencies**:
   ```bash
   npm install
   ```

3. **Start the frontend**:
   ```bash
   npm start
   ```
   This will start the frontend on **http://localhost:3000** by default.

## Running Both Backend and Frontend Concurrently

To run both the backend and frontend simultaneously:

1. Make sure you're in the root directory of the project (where `package.json` is located).

2. If you haven't already, install `concurrently`:
   ```bash
   npm install -g concurrently
   ```

3. Add a `package.json` script to run both servers:
   * In the **root directory** (where you have both `backend` and `frontend` folders), open the `package.json` file.
   * Add the following under `"scripts"`:
     ```json
     "scripts": {
       "dev": "concurrently \"npm run dev --prefix backend\" \"npm start --prefix frontend\""
     }
     ```

4. Now, you can run both the frontend and backend servers with a single command:
   ```bash
   npm run dev
   ```
   This will start both the frontend and backend concurrently.

