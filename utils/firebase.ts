// src/utils/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// 你的专属云端密钥
const firebaseConfig = {
    apiKey: "AIzaSyDJbPwrcmML7V_dj7OPhv-ndLFoMZfKxX0",
    authDomain: "happy-planet-db.firebaseapp.com",
    databaseURL: "https://happy-planet-db-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "happy-planet-db",
    storageBucket: "happy-planet-db.firebasestorage.app",
    messagingSenderId: "707745533979",
    appId: "1:707745533979:web:f94c29b8e4a5939077e8be"
};

// 初始化 Firebase 应用
const app = initializeApp(firebaseConfig);

// 导出数据库 (Firestore) 和 身份验证 (Auth) 模块，供其他文件使用
export const db = getFirestore(app);
export const auth = getAuth(app);