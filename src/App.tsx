import { useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { ExamProvider } from "./context/ExamContext";
import Approuter from "./routers/Approuter";
import { seedDemoData } from "./utils/seedDemoData";

function App() {
  useEffect(() => {
    seedDemoData();
  }, []);

  return (
    <ThemeProvider>
      <ExamProvider>
        <Approuter />
      </ExamProvider>
    </ThemeProvider>
  );
}

export default App;
