# 🌾 AI-Based Crop Disease Identification & Farmer Advisory Platform

An **AI-powered web platform** that helps farmers identify possible crop diseases from images and provides useful farmer advisory information.

The farmer can upload an image of an affected **leaf, stem, flower, fruit, grain, or root**. The image is processed by the backend and analyzed by an AI/ML model. The predicted disease and related advisory information are then displayed on the frontend.

---

## 📌 Problem Statement

Farmers may face difficulty identifying crop diseases correctly and at an early stage. Incorrect identification or delayed action can result in:

* Crop damage
* Reduced yield
* Unnecessary pesticide usage
* Increased farming expenses

This project uses **Artificial Intelligence** to analyze crop images and provide a possible disease prediction along with farmer advisory information.

---

## 💡 Proposed Solution

Our solution is a web-based farmer platform where:

1. The farmer opens the web application.
2. The farmer logs in or registers.
3. The farmer uploads an affected crop image.
4. The frontend sends the image to the FastAPI backend.
5. FastAPI receives and processes the request.
6. The backend sends the image/data to the AI model.
7. The AI model predicts the possible crop disease.
8. The backend obtains disease and advisory information.
9. The result is sent back to the frontend.
10. The farmer views the predicted disease, confidence/prediction information and advisory.

### Architecture

```text
Farmer
   ↓
Frontend
   ↓
FastAPI Backend
   ↓
AI/ML Model
   ↓
Database / Advisory Data
   ↓
FastAPI Backend
   ↓
Frontend
   ↓
Disease Prediction + Farmer Advisory
```

---

## 🛠️ Technologies Used

| Technology                      | Purpose                                                     |
| ------------------------------- | ----------------------------------------------------------- |
| React / HTML / CSS / JavaScript | Farmer-facing frontend and user interface                   |
| Python                          | Backend and AI/ML development                               |
| FastAPI                         | Backend API layer                                           |
| AI/ML Model                     | Crop disease prediction                                     |
| Database                        | Stores users, predictions, history and advisory information |
| Market Price API                | Agricultural market-price information                       |
| Vercel                          | Frontend deployment                                         |
| Render / Railway                | FastAPI backend deployment                                  |

These technologies and their roles are described in the project documentation.

---

## 🚀 Main Features

### 👨‍🌾 Farmer Registration & Login

Allows farmers to register and securely access the platform.

### 🌱 Crop Disease Detection

Farmers can upload crop images for AI-based disease prediction.

Supported crop parts can include:

* Leaf
* Stem
* Flower
* Fruit
* Grain
* Root

### 💊 Farmer Advisory

After prediction, the platform can provide:

* Disease information
* Symptoms
* Management guidance
* Prevention information

### 📊 Prediction History

Farmers can review their previous crop disease predictions.

### 💰 Market Prices

The platform can display agricultural market-price information when the Market Price API is connected.

### 📱 Farmer-Friendly Interface

The system is designed to provide a simple image-upload workflow suitable for farmers.

The main modules documented for the project are registration/login, disease detection, advisory, market prices, and history/dashboard.

---

## 🔌 API Endpoints

### Disease Prediction

```http
POST /predict
```

Used to upload a crop image and receive the predicted disease.

Flow:

```text
Frontend
   ↓
POST /predict
   ↓
FastAPI
   ↓
AI Model
   ↓
Disease Prediction
   ↓
Frontend
```

### Market Prices

```http
GET /market-prices
```

Used to request available agricultural market-price information.

### Prediction History

```http
GET /history
```

Used to retrieve previously stored prediction history.

These example API flows are defined in the project documentation.

---

## ⚡ GET and POST

### GET

GET is used to **retrieve information** from the backend.

Example:

```http
GET /market-prices
GET /history
```

### POST

POST is used to **send information** to the backend.

Example:

```http
POST /predict
```

A crop image can be sent to the backend using a POST request.

---

## 🔐 FastAPI `/docs`

FastAPI automatically provides a Swagger UI at:

```text
/docs
```

Example:

```text
https://your-backend-url.com/docs
```

The `/docs` page is mainly a **developer/testing interface**, not the main farmer-facing website.

It allows developers to:

* View available API endpoints
* Test GET and POST requests
* Upload test data
* Check API responses
* Test authenticated APIs

---

## 🔑 Authorize Button

The **Authorize** button in Swagger UI is used when the backend has authenticated/protected APIs.

Typical flow:

```text
Login
  ↓
Access Token
  ↓
Authorize
  ↓
Protected API
```

The token can be entered through the Authorize button so that protected endpoints can be tested.

---

## 🧠 AI/ML Workflow

The AI component follows these general stages:

```text
Crop Image Dataset
       ↓
Data Preparation
       ↓
Image Resizing / Cleaning
       ↓
Training / Validation / Testing
       ↓
AI/ML Model Training
       ↓
Model Evaluation
       ↓
Disease Prediction
```

The project documentation describes collecting healthy and diseased crop images, preparing the data, training an image-classification model and evaluating its performance.

---

## 🗄️ Database

The database/application data can contain information such as:

* User accounts
* Prediction history
* Disease information
* Farmer advisory information
* Other application data

The backend connects the frontend, AI model and database.

---

## 🔄 Complete Project Workflow

```text
             FARMER
                │
                ▼
        ┌───────────────┐
        │   FRONTEND    │
        │ Login / Upload│
        └───────┬───────┘
                │
                ▼
        ┌───────────────┐
        │    FASTAPI    │
        │    BACKEND    │
        └───────┬───────┘
                │
          ┌─────┴─────┐
          ▼           ▼
    ┌──────────┐  ┌──────────┐
    │ AI MODEL │  │ DATABASE │
    └────┬─────┘  └────┬─────┘
         │             │
         └──────┬──────┘
                ▼
        ┌───────────────┐
        │    FASTAPI    │
        └───────┬───────┘
                │
                ▼
        ┌───────────────┐
        │   FRONTEND    │
        │ Disease +     │
        │ Advisory      │
        └───────────────┘
```

---

## 📂 Suggested Project Structure

```text
AI-Crop-Disease-Platform/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── main.py
│   ├── models/
│   ├── routes/
│   ├── database/
│   ├── requirements.txt
│   └── ...
│
├── dataset/
│   ├── healthy/
│   └── diseased/
│
├── README.md
└── .gitignore
```

> Update this structure according to the actual folders in your GitHub repository.

---

## ⚙️ How to Run the Project

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

```bash
cd AI-Crop-Disease-Platform
```

### 2. Start the Backend

Go to the backend folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn main:app --reload
```

The backend will normally be available at:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

---

### 3. Start the Frontend

Open another terminal and go to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend URL will be shown in the terminal.

---

## 🌐 Deployment

The project can be deployed using cloud services.

### Frontend

The frontend can be deployed using:

```text
Vercel
```

### Backend

The FastAPI backend can be deployed using:

```text
Render
```

or

```text
Railway
```

The project documentation identifies Vercel for frontend deployment and Render/Railway as backend deployment options.

---

## 📈 Advantages

* **Early detection** – Helps identify possible diseases before they become severe.
* **Quick results** – AI prediction can be generated quickly.
* **Easy to use** – Farmers can upload images through a simple interface.
* **Reduced unnecessary input use** – Better identification can help avoid inappropriate treatment decisions.
* **Farmer advisory** – Provides symptoms, management and prevention guidance.
* **Accessible** – Can be used from a phone or computer with internet access.
* **Centralized platform** – Disease detection, advisory, history and market information can be combined.
* **Scalable** – Can be expanded to additional crops, diseases, languages and services.
* **Record keeping** – Prediction history allows farmers to review previous observations.

---

## 🔮 Future Enhancements

The platform can be expanded with:

* 🌐 Regional language support
* 🎤 Voice assistance
* 🌦️ Weather information
* 👨‍🌾 Expert consultation
* 🌾 More crops
* 🦠 More diseases
* 📊 Advanced analytics
* 💰 More agricultural market information

The project documentation specifically identifies regional languages, voice assistance, weather and expert consultation as possible extensions.

---

## 🧪 Testing

The application should be tested for:

* Valid crop images
* Invalid images
* API requests
* API responses
* User authentication
* Disease prediction workflow
* Prediction history
* Frontend-backend communication

Testing is included as a separate stage in the documented project-building process.

---

## 🎯 Project Highlight

The major highlight of this project is the integration of **AI-based crop image analysis with a practical farmer web platform**.

Instead of only creating a disease classification model, the project connects:

```text
AI Model
   +
FastAPI Backend
   +
Frontend
   +
Database
   +
Farmer Advisory
   +
Prediction History
   +
Market Information
```

This creates a centralized platform for farmer-oriented crop disease assistance.

---

## ⚠️ Disclaimer

The AI prediction is intended as **decision-support information** and should not be considered a guaranteed diagnosis.

For severe or uncertain crop problems, farmers should also consult qualified agricultural experts.

---

## 👥 Project Team

**Project:** AI-Based Crop Disease Identification & Farmer Advisory Platform

**Domain:** Artificial Intelligence / Machine Learning / Agriculture

**Application Type:** Web-Based Platform

---

## 📌 One-Line Summary

> **An AI-powered web platform that identifies possible crop diseases from images and provides farmer advisory through a FastAPI-based backend.**
