import axios from "axios";
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export const axiosNoPrefix = axios.create({ 
  baseURL: import.meta.env.MODE=== "development" ? "http://localhost:5001/" : "/",
});
