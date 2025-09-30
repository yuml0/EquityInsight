import "./App.css";
import { PortfolioPage } from "./components/PortfolioPage";
import { TestHTMLReport } from "./components/TestHTMLReport";

function App() {
  return (
    <div className="w-screen h-screen flex">
      <PortfolioPage />
      {/* Uncomment the line below to test HTML report generation */}
      {/* <TestHTMLReport /> */}
    </div>
  );
}

export default App;
