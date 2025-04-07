import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { MinesweeperProvider } from "./MinesweeperContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MinesweeperProvider>
      <App />
    </MinesweeperProvider>
  </StrictMode>,
);
