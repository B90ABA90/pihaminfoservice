import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initPerfDetection } from "./lib/perf";

initPerfDetection();
createRoot(document.getElementById("root")!).render(<App />);
