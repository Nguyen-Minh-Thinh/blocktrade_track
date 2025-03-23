import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DefaulPage from "./pages/DefaulPage";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<DefaulPage />} >
          <Route path="" element={<HomePage />} />
          

        </Route>
      </Routes>
    </div>
  );
}

export default App;
