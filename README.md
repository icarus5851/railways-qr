# RailTrack - Railway Component Tracking System

This repository contains the full-stack application for the AI-powered tracking of railway components. It includes a React frontend and a Python (Flask) backend.

---

## 🚀 Project Setup Guide

Follow these steps to get the entire application running on your local machine.

### **1. Prerequisites**

Make sure you have the following software installed:
- [**Git**](https://git-scm.com/downloads) (git bash)
- [**Node.js**](https://nodejs.org/) (version 18 or higher)
- [**Python**](https://www.python.org/downloads/) (version 3.10 or higher)

---

### **2. Environment Setup (.env file)**

This project uses a `.env` file to store secret keys and configuration.

1.  In the `backend` folder, create a new file named `.env`.
2.  Copy the content of `.env.example` below and paste it into your new `.env` file.
3.  Fill in the values for each variable as described.

#### **`.env.example`**
```
# Get this from your MongoDB Atlas cluster after creating a project
MONGO_URI="mongodb+srv://<username>:<password>@cluster_url/yourDBName?retryWrites=true&w=majority"

# Get this from Google AI Studio ([https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey))
GOOGLE_AI_API_KEY="your_google_ai_api_key"

# A long, random string you create for securing login tokens
JWT_SECRET_KEY="your_super_secret_key"

# Admin credentials for the application
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your_hashed_admin_password"
```

**Important: Hashing the Admin Password**
Do not store the plain text password in the `.env` file.
1. Create a temporary Python file (e.g., `generate_hash.py`) in the `backend` folder.
2. Paste and run the following code:
    ```python
    import bcrypt
    password = b"your-chosen-password" # Enter your desired password here
    hashed = bcrypt.hashpw(password, bcrypt.gensalt())
    print("Copy this hash into your .env file:")
    print(hashed.decode('utf-8'))
    ```
3. Run `python generate_hash.py`.
4. Copy the long hashed string it prints and paste that as the value for `ADMIN_PASSWORD` in your `.env` file, and delete the generate_hash.py file.

---

### **3. Backend Setup**

1.  **Open a terminal** and navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    # For Windows
    python -m venv venv
    .\venv\Scripts\activate

    # For git bash in Windows
    python3 -m venv venv
    source venv/Scripts/activate
    ```

3.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the backend server:**
    The first time you run this, it will seed the database with 10 sample components.
    ```bash
    python app.py
    ```
    The backend will now be running at `http://localhost:8000`.

---

### **4. Frontend Setup**

1.  **Open a second, separate terminal** and navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

3.  **Run the frontend server:**
    ```bash
    npm run dev
    ```
    The frontend will now be running at `http://localhost:5173`.

You can now open your browser, go to `http://localhost:5173`, and use the application.