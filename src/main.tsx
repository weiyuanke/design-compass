import { createRoot } from "react-dom/client";
import "./crypto-polyfill";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
