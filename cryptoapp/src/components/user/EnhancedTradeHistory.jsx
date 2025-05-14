import React, { useState, useEffect } from "react";
import { DatePicker, Table, Button, Spin, Empty, Select, Tooltip, Badge } from "antd";
import { SearchOutlined, FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const EnhancedTradeHistory = ({ userId }) => {
  const [dateRange, setDateRange] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uniqueSymbols, setUniqueSymbols] = useState([]);
  const [selectedType, setSelectedType] = useState("all");

  // Fetch all transactions
  const fetchAllTransactions = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/transactions?user_id=${userId}`);
      const result = await response.json();
      const transactions = result.transactions || [];

      const mappedData = transactions.map((tx, index) => ({
        key: index,
        id: tx.id || index,
        time: dayjs(tx.trans_date).format("YYYY-MM-DD HH:mm:ss"),
        timestamp: dayjs(tx.trans_date).valueOf(),
        name: tx.coin_name,
        symbol: tx.coin_symbol.toUpperCase(),
        type: tx.type,
        price: parseFloat(tx.price),
        amount: parseFloat(tx.amount),
        totalValue: (parseFloat(tx.amount) * parseFloat(tx.price)),
      }));

      // Extract unique symbols for the filter dropdown
      const symbols = [...new Set(mappedData.map(item => item.symbol))];
      setUniqueSymbols(symbols);
      
      // Sort by newest first
      const sortedData = mappedData.sort((a, b) => b.timestamp - a.timestamp);
      
      setOriginalData(sortedData);
      setFilteredData(sortedData);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTransactions();
  }, [userId]);

  // Apply filters when search button is clicked
  const handleSearch = () => {
    let filtered = [...originalData];

    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf('day').valueOf();
      const endDate = dateRange[1].endOf('day').valueOf();
      
      filtered = filtered.filter(item => 
        item.timestamp >= startDate && item.timestamp <= endDate
      );
    }

    // Filter by symbol
    if (selectedSymbol) {
      filtered = filtered.filter(item => 
        item.symbol === selectedSymbol
      );
    }

    // Filter by transaction type
    if (selectedType !== "all") {
      filtered = filtered.filter(item => 
        item.type.toLowerCase() === selectedType.toLowerCase()
      );
    }

    setFilteredData(filtered);
  };

  // Reset all filters
  const resetFilters = () => {
    setDateRange(null);
    setSelectedSymbol("");
    setSelectedType("all");
    setFilteredData(originalData);
  };

  const columns = [
    {
      title: "Date & Time",
      dataIndex: "time",
      key: "time",
      render: (text) => (
        <div className="whitespace-nowrap text-gray-300">{text}</div>
      ),
    },
    {
      title: "Coin",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <div className="flex items-center">
          <div>
            <div className="font-medium text-white">{record.name}</div>
            <div className="text-xs text-gray-400">{record.symbol}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        const isBuy = type.toLowerCase() === "buy";
        return (
          <Badge 
            color={isBuy ? "green" : "red"} 
            text={
              <span className={`font-medium ${isBuy ? "text-green-400" : "text-red-400"}`}>
                {type.toUpperCase()}
              </span>
            }
          />
        );
      },
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <div className="font-medium text-white">${price.toFixed(2)}</div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount, record) => (
        <div className="font-medium text-white">
          {amount.toFixed(4)} {record.symbol}
        </div>
      ),
    },
    {
      title: "Total Value",
      dataIndex: "totalValue",
      key: "totalValue",
      render: (value) => (
        <div className="font-medium text-white">${value.toFixed(2)}</div>
      ),
    }
  ];

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-gray-100 mb-4">Trade History</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-400 mb-1">Date Range</div>
            <RangePicker 
              className="w-full bg-gray-700 border-gray-600 text-gray-300"
              value={dateRange}
              onChange={setDateRange}
              allowClear
            />
          </div>
          
          <div>
            <div className="text-sm text-gray-400 mb-1">Symbol</div>
            <Select
              className="w-full dark-select"
              placeholder="Select symbol"
              value={selectedSymbol}
              onChange={setSelectedSymbol}
              allowClear
              options={uniqueSymbols.map(symbol => ({
                label: symbol,
                value: symbol
              }))}
            />
          </div>
          
          <div>
            <div className="text-sm text-gray-400 mb-1">Type</div>
            <Select
              className="w-full dark-select"
              value={selectedType}
              onChange={setSelectedType}
              options={[
                { label: "All Types", value: "all" },
                { label: "Buy", value: "buy" },
                { label: "Sell", value: "sell" }
              ]}
            />
          </div>
          
          <div className="flex items-end gap-2">
            <Button 
              type="primary" 
              onClick={handleSearch} 
              className="bg-blue-600 hover:bg-blue-700 text-white border-none flex items-center"
              icon={<SearchOutlined />}
            >
              Search
            </Button>
            
            <Tooltip title="Reset Filters">
              <Button
                onClick={resetFilters}
                icon={<ReloadOutlined />}
                className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-300"
              />
            </Tooltip>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : filteredData.length === 0 ? (
        <div className="p-8">
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span className="text-gray-400">
                No transactions found with the current filters.
              </span>
            }
          />
        </div>
      ) : (
        <Table 
          columns={columns} 
          dataSource={filteredData} 
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `Total ${total} transactions`
          }} 
          className="transactions-table dark"
        />
      )}
    </div>
  );
};

export default EnhancedTradeHistory; 