import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DefaulPage from "./pages/DefaulPage";
import NewDetailPage from "./pages/NewDetailPage";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<DefaulPage />} >
          <Route path="" element={<HomePage />} />
          <Route path="newdetail" element={<NewDetailPage />} />

        </Route>
      </Routes>
    </div>
  );
}

export default App;
