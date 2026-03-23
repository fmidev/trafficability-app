import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AppProvider } from "./context/AppContext/AppContext.tsx";
import App from "./App.tsx";
import "./index.css";
import { ChakraProvider } from "@chakra-ui/react";

const theme = createTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <ChakraProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </ChakraProvider>
    </ThemeProvider>
  </StrictMode>
);
