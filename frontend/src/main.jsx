import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ProgressProvider } from "./context/ProgressContext.jsx";
import { SdProgressProvider } from "./context/SdProgressContext.jsx";
import { HftProgressProvider } from "./context/HftProgressContext.jsx";
import { KbProgressProvider } from "./context/KbProgressContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ThemeProvider>
        <ProgressProvider>
          <SdProgressProvider>
            <HftProgressProvider>
              <KbProgressProvider>
                <App />
              </KbProgressProvider>
            </HftProgressProvider>
          </SdProgressProvider>
        </ProgressProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
