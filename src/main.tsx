import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/fraunces/index.css";
import "@fontsource-variable/nunito-sans/index.css";
import "@fontsource/jetbrains-mono/index.css";
import "@fontsource-variable/caveat/index.css";
import "./styles/global.css";
import App from "./App";
import { initTheme } from "./lib/theme";

initTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
