import React, { useState } from "react";
import { Menu, Table, Button, Space, DatePicker, Avatar, Upload } from "antd";
import { AppstoreOutlined, EditOutlined, HistoryOutlined, UploadOutlined } from "@ant-design/icons";
import moment from "moment";

const DarkHeaderCell = (props) => (
  <th
    {...props}
    style={{
      backgroundColor: "#1f2b3a",
      color: "#fff",
      padding: "8px",
      border: "1px solid #2d3748",
      fontWeight: 500,
      ...props.style,
    }}
  />
);

const DarkBodyCell = (props) => (
  <td
    {...props}
    style={{
      backgroundColor: "transparent",
      color: "#000000",
      padding: "8px",
      border: "1px solid #2d3748",
      ...props.style,
    }}
  />
);

const UserInfo = () => {
  const [activeKey, setActiveKey] = useState("portfolio");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState("");

  // Dữ liệu ví dụ cho Portfolio
  const portfolioData = [
    { key: 1, coin: "Bitcoin", symbol: "btc", amount: 2, price: 50000, totalValue: 100000 },
    { key: 2, coin: "Ethereum", symbol: "eth", amount: 5, price: 2000, totalValue: 10000 },
    { key: 3, coin: "Litecoin", symbol: "ltc", amount: 10, price: 150, totalValue: 1500 },
  ];

  // Icon cho từng loại coin
  const coinIcons = {
    btc: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
    eth: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    ltc: "https://cryptologos.cc/logos/litecoin-ltc-logo.png",
  };

  const tradeHistoryData = [
    { key: 1, time: "2021-01-25", symbol: "COMP/USDT Perpetual", side: "Sell", price: 615.0, quantity: 14.15, fee: "0.0583000 USDT", realizedProfit: "0.124999 USDT" },
    { key: 2, time: "2021-01-25", symbol: "COMP/USDT Perpetual", side: "Sell", price: 615.0, quantity: 39.37, fee: "0.149159 USDT", realizedProfit: "0.000000 USDT" },
    { key: 3, time: "2021-01-25", symbol: "BNB/USDT Perpetual", side: "Sell", price: 535.6, quantity: 14.15, fee: "0.0583000 USDT", realizedProfit: "0.124999 USDT" },
    { key: 4, time: "2021-01-25", symbol: "BNB/USDT Perpetual", side: "Sell", price: 536.4, quantity: 44.8, fee: "0.186325 USDT", realizedProfit: "0.312345 USDT" },
    { key: 5, time: "2021-01-25", symbol: "ETH/USDT Perpetual", side: "Sell", price: 2145.12, quantity: 2.35, fee: "0.012345 USDT", realizedProfit: "1.234567 USDT" },
    { key: 6, time: "2021-01-25", symbol: "ETH/USDT Perpetual", side: "Sell", price: 2105.62, quantity: 2.14, fee: "0.010100 USDT", realizedProfit: "0.888888 USDT" },
  ];

  const [filteredTradeHistoryData, setFilteredTradeHistoryData] = useState(tradeHistoryData);

  const [userInfo, setUserInfo] = useState({
    name: "Nguyễn Văn A",
    email: "nguyen@gmail.com",
    username: "AA",
    avatar: "https://joeschmoe.io/api/v1/random",
  });

  const handleAvatarChange = (info) => {
    if (info.file.status === "done") {
      setUserInfo({ ...userInfo, avatar: info.file.response.url });
    }
  };

  // Hàm tìm kiếm chỉ lọc theo symbol (không sử dụng fromDate, toDate)
  const handleSearch = () => {
    let filteredData = tradeHistoryData;

    if (selectedSymbol.trim() !== "") {
      filteredData = filteredData.filter((trade) =>
        trade.symbol.toLowerCase().includes(selectedSymbol.toLowerCase())
      );
    }

    setFilteredTradeHistoryData(filteredData);
  };

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
                  render: (text, record) => (
                    <Space>
                      <img src={coinIcons[record.symbol]} alt={record.coin} style={{ width: 24, height: 24 }} />
                      <span className="text-white">{text}</span>
                    </Space>
                  ),
                },
                {
                  title: "Quantity",
                  dataIndex: "amount",
                },
                {
                  title: "Price",
                  dataIndex: "price",
                  render: (price) => `$${price.toFixed(2)}`,
                },
                {
                  title: "Total Value",
                  dataIndex: "totalValue",
                  render: (totalValue) => `$${totalValue.toFixed(2)}`,
                },
              ]}
              pagination={false}
              bordered
              components={{
                header: { cell: DarkHeaderCell },
                body: { cell: DarkBodyCell },
              }}
            />
          </div>
        );

      case "transactionHistory":
        const tradeHistoryColumns = [
          { title: "Time", dataIndex: "time", key: "time" },
          { title: "Symbol", dataIndex: "symbol", key: "symbol" },
          { title: "Side", dataIndex: "side", key: "side" },
          {
            title: "Price",
            dataIndex: "price",
            key: "price",
            render: (price) => price.toFixed(2),
          },
          {
            title: "Quantity",
            dataIndex: "quantity",
            key: "quantity",
            render: (qty) => qty.toFixed(4),
          },
          { title: "Fee", dataIndex: "fee", key: "fee" },
          { title: "Realized Profit", dataIndex: "realizedProfit", key: "realizedProfit" },
        ];

        return (
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Trade History</h2>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {/* DatePicker vẫn được giữ hiển thị */}
              <DatePicker
                placeholder="From YYYY-MM-DD"
                className="bg-gray-700 text-white"
                value={fromDate}
                onChange={setFromDate}
              />
              <DatePicker
                placeholder="To YYYY-MM-DD"
                className="bg-gray-700 text-white"
                value={toDate}
                onChange={setToDate}
              />
              <input
                type="text"
                placeholder="Nhập symbol"
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="bg-gray-700 text-white placeholder-gray-400  p-1 rounded w-15"
              />
              <Button onClick={handleSearch} className="bg-blue-600 text-white hover:bg-blue-500">
                Search
              </Button>
            </div>
            <Table
              dataSource={filteredTradeHistoryData}
              columns={tradeHistoryColumns}
              pagination={false}
              bordered
              components={{ header: { cell: DarkHeaderCell }, body: { cell: DarkBodyCell } }}
            />
          </div>
        );

        case "editProfile":
          return (
            <div className="p-6 flex flex-col">
              <div className="flex mb-6">
                <div className="w-1/2 p-4">
                  <h2 className="text-2xl font-semibold text-white mb-4">My Profile</h2>
                  <div className="flex center mb-6">
                    <Upload
                      action="/upload"
                      listType="picture-card"
                      showUploadList={false}
                      onChange={handleAvatarChange}
                      className="avatar-upload z-50"
                    >
                      {userInfo.avatar ? (
                        <Avatar size={64} src={userInfo.avatar} className="border-2 border-gray-800" />
                      ) : (
                        <div
                          className="flex text-white"
                          style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "50%",
                            backgroundColor: "#333",
                          }}
                        ></div>
                      )}
                    </Upload>
                  </div>
                </div>
              </div>
        
              <div className="flex">
                <div className="w-1/2 p-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      alert("Thông tin đã được cập nhật!");
                    }}
                  >
                    <div className="mb-4">
                      <label htmlFor="name" className="text-white">Your Name</label>
                      <input
                        id="name"
                        name="name"
                        value={userInfo.name}
                        onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                        placeholder="Nhập tên của bạn"
                        className="bg-gray-700 text-white placeholder-gray-500 w-full p-2 mt-2"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="email" className="text-white">Your Email</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={userInfo.email}
                        onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                        placeholder="Nhập email của bạn"
                        className="bg-gray-700 text-white border-none placeholder-gray-500 w-full p-2 mt-2"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="username" className="text-white">Your username</label>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        value={userInfo.username}
                        onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })}
                        placeholder="Nhập username của bạn"
                        className="bg-gray-700 text-white border-none placeholder-gray-500 w-full p-2 mt-2"
                      />
                    </div>
                    <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-lg">
                      Save
                    </button>
                  </form>
                </div>
        
                <div className="w-1/2 p-4 ml-6">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      alert("Mật khẩu đã được thay đổi!");
                    }}
                  >
                    <div className="mb-4">
                      <label htmlFor="oldPassword" className="text-white">Old Password</label>
                      <input
                        id="oldPassword"
                        name="oldPassword"
                        type="password"
                        placeholder="Nhập mật khẩu cũ"
                        required
                        className="bg-gray-700 text-white border-none placeholder-gray-500 w-full p-2 mt-2"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="newPassword" className="text-white">New Password</label>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        placeholder="Nhập mật khẩu mới"
                        required
                        className="bg-gray-700 text-white border-none placeholder-gray-500 w-full p-2 mt-2"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="confirmPassword" className="text-white">Confirm New Password</label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Xác nhận mật khẩu mới"
                        required
                        className="bg-gray-700 text-white border-none placeholder-gray-500 w-full p-2 mt-2"
                      />
                    </div>
                    <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-lg">
                      Change Password
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
