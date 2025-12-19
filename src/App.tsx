import { ThemeProvider } from "./context/ThemeContext"
import { ExamProvider } from "./context/ExamContext";
import Approuter from "./routers/Approuter";

function App() {
  return (
    <ThemeProvider>
      <ExamProvider>
        <Approuter />
      </ExamProvider>
    </ThemeProvider>
  );
}

export default App;
