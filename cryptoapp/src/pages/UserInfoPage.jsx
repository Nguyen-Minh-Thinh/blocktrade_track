import React, { useState, useEffect } from "react";
import { Menu, Table, Button, Space, DatePicker } from "antd";
import { AppstoreOutlined, EditOutlined, HistoryOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom"; 
import { checkAuth, updateUser, verifyOldPassword } from '../api/auth';
import axios from 'axios';
import dayjs from "dayjs";
import TradeHistory from '../components/TradeHistory'

const DarkHeaderCell = (props) => (
  <th {...props} style={{ backgroundColor: "#1f2b3a", color: "#fff", padding: "8px", border: "1px solid #2d3748", fontWeight: 500, ...props.style }} />
);

const DarkBodyCell = (props) => (
  <td {...props} style={{ backgroundColor: "transparent", color: "#000000", padding: "8px", border: "1px solid #2d3748", ...props.style }} />
);

const UserInfo = () => {
  const [activeKey, setActiveKey] = useState("portfolio");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [formData, setFormData] = useState({
    user_id: "",
    name: "",
    email: "",
    username: "",
    password: "",
    points: 0,
  });
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileErrorMessage, setProfileErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [profileSuccessMessage, setProfileSuccessMessage] = useState("");
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");
  const [portfolioData, setPortfolioData] = useState([]);
  const navigate = useNavigate();

  // const [filteredTradeHistoryData, setFilteredTradeHistoryData] = useState(tradeHistoryData);

  // Load user from localStorage
  const loadUserFromStorage = () => {
    const userData = localStorage.getItem("userLogin");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setFormData({
        user_id: parsedUser.user_id || "",
        name: parsedUser.name || "",
        email: parsedUser.email || "",
        username: parsedUser.username || "",
        password: "",
        points: parsedUser.points || 0,
      });
      setImageUrl(parsedUser.image_url || "");
      return parsedUser;
    }
    return null;
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      try {
        // First, try to load user from localStorage
        const localUser = loadUserFromStorage();

        // If localStorage has user data, attempt to verify with checkAuth
        if (localUser) {
          const userData = await checkAuth();
          if (userData) {
            // Update formData with the latest data from the server
            setFormData({
              user_id: userData.user_id || "",
              name: userData.name || "",
              email: userData.email || "",
              username: userData.username || "",
              password: "",
              points: userData.points || 0,
            });
            setImageUrl(userData.image_url || "");
            // Update localStorage with the latest user data
            localStorage.setItem("userLogin", JSON.stringify(userData));
          } else {
            // If checkAuth fails, clear localStorage but don't redirect immediately
            localStorage.removeItem("userLogin");
            window.dispatchEvent(new Event("userUpdated"));
            setProfileErrorMessage("Session expired. Please log in again.");
            setTimeout(() => {
              setProfileErrorMessage("");
              navigate("/"); // Redirect after showing the error message
            }, 2000);
          }
        } else {
          // If no user in localStorage, try checkAuth
          const userData = await checkAuth();
          if (userData) {
            setFormData({
              user_id: userData.user_id || "",
              name: userData.name || "",
              email: userData.email || "",
              username: userData.username || "",
              password: "",
              points: userData.points || 0,
            });
            setImageUrl(userData.image_url || "");
            localStorage.setItem("userLogin", JSON.stringify(userData));
          } else {
            setProfileErrorMessage("Please log in to access this page.");
            setTimeout(() => {
              setProfileErrorMessage("");
              navigate("/");
            }, 2000);
          }
        }
      } catch (error) {
        setProfileErrorMessage("Failed to load user info. Please log in again.");
        setTimeout(() => {
          setProfileErrorMessage("");
          navigate("/");
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();

    // Listen for user updates from other components
    const handleUserUpdated = () => {
      loadUserFromStorage();
    };

    window.addEventListener("userUpdated", handleUserUpdated);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("userUpdated", handleUserUpdated);
    };
  }, [navigate]);
  
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/portfolio?user_id=${formData.user_id}`);
        const rawData = response.data.portfolio;
        
        const formattedData = rawData.map((item, index) => ({
          key: index + 1,
          coin: item.coin_name,
          coin_id: item.coin_id,
          symbol: item.coin_symbol,
          amount: item.amount,
          price: item.purchase_price,
          totalValue: item.amount * item.purchase_price,
          image: item.coin_image_url
        }));

        setPortfolioData(formattedData);
      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu portfolio:", error);
      }
    };

    fetchPortfolio();
  }, [formData.user_id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileErrorMessage("");
    setProfileSuccessMessage("");
    if (!formData.user_id) {
      setProfileErrorMessage("User ID is missing. Please log in.");
      setTimeout(() => {
        setProfileErrorMessage("");
        navigate("/");
      }, 2000);
      return;
    }

    setLoading(true);
    try {
      const response = await updateUser(formData, image);
      const updatedUser = {
        ...formData,
        image_url: response.image_url || imageUrl,
        points: response.points || formData.points || 0,
      };
      localStorage.setItem("userLogin", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("userUpdated"));
      setProfileSuccessMessage("Updated successfully");
      setTimeout(() => setProfileSuccessMessage(""), 2000);

      if (response.image_url) {
        setImageUrl(response.image_url);
        setPreviewImage("");
        setImage(null);
      }
    } catch (error) {
      setProfileErrorMessage(error.error || "Failed to update profile");
      setTimeout(() => setProfileErrorMessage(""), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordErrorMessage("");
    setPasswordSuccessMessage("");
    const oldPassword = e.target.oldPassword.value;
    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordErrorMessage("Vui lòng điền đầy đủ tất cả các trường");
      setTimeout(() => setPasswordErrorMessage(""), 2000);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMessage("Mật khẩu mới và xác nhận mật khẩu không khớp");
      setTimeout(() => setPasswordErrorMessage(""), 2000);
      return;
    }

    setLoading(true);
    try {
      await verifyOldPassword(formData.username, oldPassword);
      const userData = { user_id: formData.user_id, password: newPassword };
      await updateUser(userData, null);
      setPasswordSuccessMessage("Updated successfully");
      setTimeout(() => setPasswordSuccessMessage(""), 2000);
      e.target.reset();
    } catch (error) {
      if (error.error === "Old password is incorrect") {
        setPasswordErrorMessage("Old password is incorrect");
        setTimeout(() => setPasswordErrorMessage(""), 2000);
      } else {
        setPasswordErrorMessage(error.error || "Cập nhật mật khẩu thất bại");
        setTimeout(() => setPasswordErrorMessage(""), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // const [filteredTradeHistoryData, setFilteredTradeHistoryData] = useState([]);



  
  const renderContent = () => {
    switch (activeKey) {
      case "portfolio":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Portfolio</h2>
            <Table
              dataSource={portfolioData}
              columns={[
                {
                  title: "Coin",
                  dataIndex: "coin",
                  render: (_text, record) => (
                    <Space>
                      <img src={record.image} alt={record.coin} style={{ width: 24, height: 24 }} />
                      <span className="text-black">{record.coin}</span>
                    </Space>
                  ),
                },
                { title: "Quantity", dataIndex: "amount" },
                { title: "Price", dataIndex: "price", render: (price) => `${price.toFixed(2)} USDT` },
                { title: "Total Value", dataIndex: "totalValue", render: (totalValue) => `${totalValue.toFixed(2)} USDT` },
              ]}
              pagination={false}
              bordered
              components={{ header: { cell: DarkHeaderCell }, body: { cell: DarkBodyCell } }}
              onRow={(record) => ({
                onClick: () => navigate("/coindetail", { state: { coin_id: record.coin_id, symbol: record.symbol } }),
                style: { cursor: "pointer" }, // Đổi con trỏ chuột để gợi ý người dùng có thể click
              })}
            />
          </div>
        );

      case "transactionHistory":
        return <TradeHistory userId={formData.user_id} />;

      case "editProfile":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">Edit Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Info */}
              <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex justify-center mb-6">
                  <label
                    htmlFor="imageInput"
                    className="cursor-pointer w-20 h-20 rounded-full overflow-hidden border-2 border-gray-700 flex items-center justify-center bg-gray-800"
                  >
                    <img
                      src={previewImage || imageUrl || "https://via.placeholder.com/80"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </label>
                  <input
                    type="file"
                    id="imageInput"
                    name="image"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="text-white text-sm font-medium mb-1 block">
                      Your Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nhập tên của bạn"
                      className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="text-white text-sm font-medium mb-1 block">
                      Your Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Nhập email của bạn"
                      className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="username" className="text-white text-sm font-medium mb-1 block">
                      Your Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Nhập username của bạn"
                      className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <input
                      id="points"
                      name="points"
                      type="number"
                      value={formData.points}
                      onChange={handleChange}
                      placeholder="Points"
                      className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      disabled
                      hidden
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-700 transition-all ${
                      loading ? "bg-gray-500" : profileErrorMessage ? "bg-red-500" : profileSuccessMessage ? "bg-green-500" : "bg-blue-500 hover:bg-blue-600"
                    } disabled:opacity-50`}
                  >
                    {loading ? "Saving..." : profileErrorMessage || profileSuccessMessage || "Save Profile"}
                  </button>
                </form>
              </div>

              {/* Change Password */}
              <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="oldPassword" className="text-white text-sm font-medium mb-1 block">
                      Old Password
                    </label>
                    <input
                      id="oldPassword"
                      name="oldPassword"
                      type="password"
                      placeholder="Nhập mật khẩu cũ"
                      required
                      className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="text-white text-sm font-medium mb-1 block">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      placeholder="Nhập mật khẩu mới"
                      required
                      className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="text-white text-sm font-medium mb-1 block">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Xác nhận mật khẩu mới"
                      required
                      className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-700 transition-all ${
                      loading ? "bg-gray-500" : passwordErrorMessage ? "bg-red-500" : passwordSuccessMessage ? "bg-green-500" : "bg-blue-500 hover:bg-blue-600"
                    } disabled:opacity-50`}
                  >
                    {loading ? "Changing..." : passwordErrorMessage || passwordSuccessMessage || "Change Password"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        );

      default:
        return <div className="p-6 text-white">Chọn một mục từ menu</div>;
    }
  };

  const menuItems = [
    { key: "portfolio", icon: <AppstoreOutlined />, label: "Portfolio" },
    { key: "transactionHistory", icon: <HistoryOutlined />, label: "Trade History" },
    { key: "editProfile", icon: <EditOutlined />, label: "Edit information" },
  ];

  return (
    <div className="flex p-6 bg-gray-950 min-h-screen">
      <div className="w-1/4 bg-gray-900/80 border border-black shadow-2xl rounded-xl p-4">
        <Menu
          mode="vertical"
          selectedKeys={[activeKey]}
          onClick={({ key }) => setActiveKey(key)}
          items={menuItems}
          theme="dark"
        />
      </div>
      <div className="w-3/4 bg-gray-900/80 border border-black shadow-2xl rounded-xl p-6 ml-6 transition-all">
        {renderContent()}
      </div>
    </div>
  );
};

export default UserInfo;