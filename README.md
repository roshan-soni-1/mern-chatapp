## 📦 Getting Started

### Prerequisites

- Node.js v14+  
- npm or yarn  

### Environment Variables

> get your firebase account json and change into base64

Create a `.env` file in the root directory and add the following keys:

```
# Firebase (service account JSON file path)
FIREBASE_JSON_PATH_BASE64=...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google SMTP
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_email_password

MONGO_DB_URI= ...
JWT_SECRET= ...
SERVE_URL=...
# Mode
NODE_ENV=development   # or production
```

> ⚠️ Make sure your `.env` file is added to `.gitignore` to avoid exposing sensitive keys.

---

### Installation & Running

1. **Clone the repository:**

```
git clone https://github.com/roshan-soni-1/chatapp.git
cd chatapp
```

2. **Install dependencies:**

```
npm install
```

3. **Build the project:**

```
npm run build
```

4. **Start the development server:**

```
npm run dev
```

5. **Start the production server:**

```
npm run start
```

6. Open your browser and navigate to: [http://localhost:3000](http://localhost:3000)


---

## 💡 Usage

1. Create an account or log in.  
2. Start chatting in real-time with online users.  
3. Enjoy instant updates without refreshing the page!  

---


## 🌟 Contributing

Contributions are welcome!  

- Fork the repository  
- Create your feature branch: `"git checkout -b feature-name"`  
- Commit your changes: `"git commit -m "Add new feature""`  
- Push to the branch: `"git push origin feature-name"`  
- Open a Pull Request  

---

## 📜 License

This project is licensed under the **[MIT License](LICENSE)**.  

---

## 💡 Ideas for Improvements

- Implement **typing indicators** ✍️  
- Add **emoji reactions** 😄  
- Enable **group chat rooms** 👥  
- Add **Push notifications** service

---

## 🔗 Live Demo (Optional)

[link](https://chatty-5b6x.onrender.com/)