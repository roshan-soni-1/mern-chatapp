import axios from "axios";

console.log("url",import.meta.env.VITE_API_URL )

//const baseURL = import.meta.env.VITE_API_URL||"http://localhost:5001/api";
const baseURL = import.meta.env.VITE_API_URL||"/api";
export const axiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

export const axiosNoPrefix = axios.create({ 
  baseURL: import.meta.env.MODE=== "development" ? "http://localhost:5001/" : "/",
});
