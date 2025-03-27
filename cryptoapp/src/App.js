import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DefaulPage from "./pages/DefaulPage";
import NewDetailPage from "./pages/NewDetailPage";
import NewPage from "./pages/NewPage";
import CoinDetailPage from "./pages/CoinDetailPage";
import MarketPage from "./pages/MarketPage";
import UserInfoPage from "./pages/UserInfoPage";
import VitualexchangePage from "./pages/VitualexchangePage";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<DefaulPage />} >
          <Route path="" element={<HomePage />} />
          <Route path="newdetail" element={<NewDetailPage />} />
          <Route path="coindetal" element={<CoinDetailPage/>} />
          <Route path="newpage" element={<NewPage />} />
          <Route path="market" element={<MarketPagea />} />
          <Route path="user-info" element={<UserInfoPage />} />
          <Route path="vitualexchange" element={<VitualexchangePageP />} />

        </Route>
      </Routes>
    </div>
  );
}

export default App;
