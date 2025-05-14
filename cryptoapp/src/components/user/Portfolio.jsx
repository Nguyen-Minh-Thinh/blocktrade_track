import React, { useState, useEffect } from "react";
import { Table, Spin, Empty, Tooltip, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AreaChartOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

const Portfolio = ({ userId }) => {
  const [portfolioData, setPortfolioData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/portfolio?user_id=${userId}`);
        const rawData = response.data.portfolio;
        
        // Calculate total portfolio value
        let total = 0;
        
        const formattedData = rawData.map((item, index) => {
          const value = item.amount * item.purchase_price;
          total += value;
          
          return {
            key: index + 1,
            coin: item.coin_name,
            coin_id: item.coin_id,
            symbol: item.coin_symbol.toUpperCase(),
            amount: item.amount,
            price: item.purchase_price,
            totalValue: value,
            image: item.coin_image_url
          };
        });

        setTotalValue(total);
        setPortfolioData(formattedData);
      } catch (error) {
        console.error("Error fetching portfolio data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchPortfolio();
    }
  }, [userId]);

  const columns = [
    {
      title: "#",
      dataIndex: "key",
      width: 60,
      render: (text) => <span className="text-gray-400">{text}</span>,
    },
    {
      title: "Coin",
      dataIndex: "coin",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <img 
            src={record.image} 
            alt={record.coin} 
            className="w-8 h-8 rounded-full"
            onError={(e) => {e.target.src = "https://cdn.coinranking.com/bOabBYkcX/bitcoin_btc.svg"}}
          />
          <div>
            <div className="font-medium text-white">{record.coin}</div>
            <div className="text-xs text-gray-400">{record.symbol}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Holdings",
      dataIndex: "amount",
      render: (amount, record) => (
        <div>
          <div className="font-medium text-white">{amount.toFixed(4)} {record.symbol}</div>
          <div className="text-xs text-gray-400">${(amount * record.price).toFixed(2)}</div>
        </div>
      ),
    },
    {
      title: "Purchase Price",
      dataIndex: "price",
      render: (price) => (
        <div className="font-medium text-white">${price.toFixed(2)}</div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <div className="flex gap-2">
          <Tooltip title="Trade">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate("/coindetail", { state: { coin_id: record.coin_id, symbol: record.symbol } });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md text-xs font-medium transition-colors"
            >
              Trading
            </button>
          </Tooltip>
          <Tooltip title="View Chart">
            <button 
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 py-1 px-2 rounded-md text-xs transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/coindetail", { state: { coin_id: record.coin_id, symbol: record.symbol, initialTab: "chart" } });
              }}
            >
              <AreaChartOutlined />
            </button>
          </Tooltip>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-100">Your Portfolio</h2>
          <div className="text-right">
            <div className="text-sm text-gray-400">Total Value</div>
            <div className="text-xl font-bold text-blue-400">${totalValue.toFixed(2)}</div>
          </div>
        </div>
      </div>
      
      {portfolioData.length === 0 ? (
        <div className="p-8">
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span className="text-gray-400">
                Your portfolio is empty. Start trading to build your portfolio!
              </span>
            }
          />
        </div>
      ) : (
        <Table 
          columns={columns}
          dataSource={portfolioData}
          pagination={false}
          className="portfolio-table dark"
          onRow={(record) => ({
            onClick: () => navigate("/coindetail", { 
              state: { coin_id: record.coin_id, symbol: record.symbol } 
            }),
            className: "cursor-pointer hover:bg-gray-700 transition-colors"
          })}
        />
      )}
    </div>
  );
};

export default Portfolio; 