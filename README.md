# ClassPing 🎓

A beautiful, mobile-first, offline-capable progressive web application (PWA) designed to help students track their college timetables seamlessly. 

With **ClassPing**, you can view your current class and countdown gracefully without any app clunkiness. Designed for speed, utility, and stunning modern aesthetics.

![ClassPing Dashboard](/public/icon.png)

## 🚀 Features

*   **Live Class Tracking**: View your current subject, active room number, and a real-time countdown to the end of your current period.
*   **Offline Mode**: Powered by LocalStorage, your timetables remain saved locally so the app runs instantly and even when your phone loses connection.
*   **Intelligent Section Switching**: Seamlessly manage and swap between multiple schedules (like 4DFCS, 4DS, etc.) using the stylish pill navigation.
*   **AI-Powered Timetable Import (Admin Only)**: Magically convert images of new timetables into structured JSON data using the power of Google Gemini OCR scanning.
*   **Manual JSON Importer**: Don't want to use AI? Just paste the raw JSON structure!
*   **Web Push Notifications**: Get notified beautifully 30 seconds before your next class starts.

## 🛠 Tech Stack

*   **Framework**: Next.js 15 (App Router)
*   **Styling**: Tailwind CSS
*   **Animations**: Framer Motion
*   **Icons**: Lucide React
*   **OCR / Vision**: Google Gemini 2.5 Flash API
*   **Storage**: Browser LocalStorage & JS-Cookies

---

## 💻 Running Locally

To run ClassPing on your local machine, follow these steps:

### 1. Clone & Install
```bash
git clone https://github.com/anujrwt08/timetable.git
cd timetable
npm install
```

### 2. Environment Setup
Since the AI scanning tool is restricted, you must provide a Google Gemini API Key and setup an admin password. 
*Create a `.env.local` file in the root directory:*
```env
# Your Google Gemini Key (Get one free from Google AI Studio)
GEMINI_API_KEY="AIza..."

# The password you want to use to unlock the AI Scanner in the UI
ADMIN_PASSWORD="super_secret_password"
```

### 3. Start the Server
```bash
npm run dev
```
Open **http://localhost:3000** in your browser.

---

## 🔒 Security Note: AI Scanner Administration
ClassPing uses the very powerful and generous Gemini 2.5 Flash API to perform image-to-JSON OCR conversions for timetables. 
Because API Keys shouldn't be accessible to 1,000+ students on campus (or they might hit rate limits reading photos), the AI component is locked behind the backend and a frontend password modal.

When visiting the live site, click the **(+) Import Button**. 
To activate the **AI Scan** function, the system will prompt an **Admin Login**. Enter your `ADMIN_PASSWORD` (set in your environment variables) to unlock the scanner.

---

## 👨‍💻 Created By
Made with ❤️ by **Anuj Rawat**
