

# PREML  
Photometric Redshift Estimation using Machine Learning

## 🛠 Installation

### 🔹 Frontend (React + Vite)

```bash
npm install
npm run dev
```

This will start the frontend development server on `localhost:5173` by default.

---

### 🔹 Backend (Python API)

1. **Set up a virtual environment** (optional but recommended):

   ```bash
   python -m venv .venv
   source .venv/bin/activate        # On Linux/macOS
   .venv\Scripts\activate           # On Windows
   ```

2. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

3. **Run the backend server**:

   ```bash
   cd backend
   python app.py
   ```

Make sure to run the backend in a **separate terminal** from the frontend.

## 🛠 Docker Setup

1. **Run the command to start frontend and backend(this requires docker and docker-compose installed)**
   ```bash
   docker compose up --build
   ``` 
