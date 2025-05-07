import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DefaulPage from "./pages/DefaulPage";
import NewDetailPage from "./pages/NewDetailPage";
import NewsPage from "./pages/NewsPage";
import CoinDetailPage from "./pages/CoinDetailPageNew";
import MarketPage from "./pages/MarketPage";
import UserInfoPage from "./pages/UserInfoPage";
import VitualexchangePage from "./pages/VitualexchangePage";
import { ToastContainer } from "react-toastify";
import ForgotPassPage from "./pages/ForgotPassPage";
import ScrollToTop from "./components/ScrollToTop";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AboutUsPage from "./pages/AboutUsPage";

function App() {
  return (
    <div className="App">
      <ToastContainer/>
      <ScrollToTop/>
      <Routes>
        <Route path="/" element={<DefaulPage />} >
          <Route path="" element={<HomePage />} />
          <Route path="newdetail" element={<NewDetailPage />} />
          <Route path="coindetail" element={<CoinDetailPage/>} />
          <Route path="news" element={<NewsPage />} />
          <Route path="market" element={<MarketPage />} />
          <Route path="user-info" element={<UserInfoPage />} />
          <Route path="vitualexchange" element={<VitualexchangePage />} />
          <Route path="forgot" element={<ForgotPassPage />} />
          <Route path="resetpass" element={<ResetPasswordPage />} />
          <Route path="about" element={<AboutUsPage/>} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
