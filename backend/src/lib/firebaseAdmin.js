import admin from "firebase-admin";
import dotenv from "dotenv"
dotenv.config({ path: '../.env' });

try {
  
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64, "base64").toString()
);

// 🔑 Fix private_key formatting
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

} catch (err) {
  console.error('Error:', err);
  
}
export default admin;