import React, { useState, useEffect } from "react";
import { DatePicker, Table, Button } from "antd";
import dayjs from "dayjs";
// import { DarkHeaderCell, DarkBodyCell } from "../pages/UserInfoPage";


const DarkHeaderCell = (props) => (
    <th {...props} style={{ backgroundColor: "#1f2b3a", color: "#fff", padding: "8px", border: "1px solid #2d3748", fontWeight: 500, ...props.style }} />
  );
  
  const DarkBodyCell = (props) => (
    <td {...props} style={{ backgroundColor: "transparent", color: "#000000", padding: "8px", border: "1px solid #2d3748", ...props.style }} />
  );
const TradeHistory = ({ userId }) => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [originalData, setOriginalData] = useState([]);
  const [filteredTradeHistoryData, setFilteredTradeHistoryData] = useState([]);

  // ✅ Hàm fetch toàn bộ dữ liệu ban đầu
  const fetchAllTransactions = async () => {
    try {
      const response = await fetch(`http://localhost:5000/transactions?user_id=${userId}`);
      const result = await response.json();
      const transactions = result.transactions || [];

      const mappedData = transactions.map((tx, index) => ({
        key: index,
        time: dayjs(tx.trans_date).format("YYYY-MM-DD HH:mm:ss"),
        name: tx.coin_name,
        symbol: tx.coin_symbol,
        side: tx.type,
        price: parseFloat(tx.price),
        quantity: parseFloat(tx.amount),
        totalValue: (tx.amount * tx.price),
      }));

      setOriginalData(mappedData);
      setFilteredTradeHistoryData(mappedData); // Hiển thị đầy đủ
    } catch (error) {
      console.error("Failed to fetch initial transactions:", error);
    }
  };

  // ✅ useEffect để load dữ liệu ngay khi component mount
  useEffect(() => {
    if (userId) {
      fetchAllTransactions();
    }
  }, [userId]);

  // ✅ Hàm xử lý lọc (khi click Search)
  const handleSearch = () => {
    let filtered = originalData;

    if (fromDate) {
      filtered = filtered.filter(item => dayjs(item.time).isAfter(dayjs(fromDate).startOf("day")));
    }

    if (toDate) {
      filtered = filtered.filter(item => dayjs(item.time).isBefore(dayjs(toDate).endOf("day")));
    }

    if (selectedSymbol) {
      filtered = filtered.filter(item =>
        item.symbol.toLowerCase().includes(selectedSymbol.toLowerCase())
      );
    }

    setFilteredTradeHistoryData(filtered);
  };

  const tradeHistoryColumns = [
    { title: "Time", dataIndex: "time", key: "time" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Symbol", dataIndex: "symbol", key: "symbol" },
    { title: "Side", dataIndex: "side", key: "side" },
    { title: "Price", dataIndex: "price", key: "price", render: (price) => price.toFixed(2) },
    { title: "Quantity", dataIndex: "quantity", key: "quantity", render: (qty) => qty.toFixed(4) },
    { title: "Total Value", dataIndex: "totalValue", key: "totalValue", render: (qty) => qty.toFixed(4) },
    // { title: "Fee", dataIndex: "fee", key: "fee" },
    // { title: "Realized Profit", dataIndex: "realizedProfit", key: "realizedProfit" },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-white mb-4">Trade History</h2>
      <div className="flex flex-wrap items-center gap-2 mb-4">
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
          placeholder="Enter symbol"
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          className="bg-gray-700 text-white placeholder-gray-400 p-1 rounded w-15"
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
};

export default TradeHistory;
