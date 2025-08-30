import { createRoot } from "react-dom/client";
import App from "./App";
import "./global.css";
import { setupErrorSuppression } from "./lib/errorSuppression";

// Setup error suppression for non-critical API errors
setupErrorSuppression();

// Create root only once
const container = document.getElementById("root")!;
const root = createRoot(container);

root.render(<App />);
