import React, { useState } from "react";
import ButtonComponent from '../components/ButtonComponent';

const categories = [
  "ALL", "APP", "EXCHANGE", "MILESTONES", "NEWS", "PARTNERSHIPS", "PORTFOLIO COMPANIES", "PRODUCT", "TRENDING"
];

const newsData = [
  { title: "Blocktrade Secures Regulatory Approval in Argentina", date: "17 MAR 2025", category: "MILESTONES", image: "argentina.png" },
  { title: "Blocktrade.com Licenced in the UAE to Offer Derivatives", date: "14 MAR 2025", category: "MILESTONES", image: "dubai.png" },
  { title: "Blocktrade.com to become Exclusive Crypto Partner for Tawasul Al Khaleej", date: "13 MAR 2025", category: "PARTNERSHIPS", image: "partnership.png" },
  { title: "Blocktrade.com Receives an Authorization as a Crypto-Asset Service Provider Under EU", date: "2D AGO", category: "NEWS", image: "mica.png" },
  { title: "Blocktrade Secures Regulatory Approval in Argentina", date: "17 MAR 2025", category: "MILESTONES", image: "argentina.png" },
  { title: "Blocktrade Secures Regulatory Approval in Argentina", date: "17 MAR 2025", category: "MILESTONES", image: "argentina.png" },
  { title: "Blocktrade.com Licenced in the UAE to Offer Derivatives", date: "14 MAR 2025", category: "MILESTONES", image: "dubai.png" },
  { title: "Blocktrade.com to become Exclusive Crypto Partner for Tawasul Al Khaleej", date: "13 MAR 2025", category: "PARTNERSHIPS", image: "partnership.png" },
  { title: "Blocktrade.com Receives an Authorization as a Crypto-Asset Service Provider Under EU", date: "2D AGO", category: "NEWS", image: "mica.png" },
  { title: "Blocktrade Secures Regulatory Approval in Argentina", date: "17 MAR 2025", category: "MILESTONES", image: "argentina.png" },
  { title: "Blocktrade.com Licenced in the UAE to Offer Derivatives", date: "14 MAR 2025", category: "MILESTONES", image: "dubai.png" },
  { title: "Blocktrade.com to become Exclusive Crypto Partner for Tawasul Al Khaleej", date: "13 MAR 2025", category: "PARTNERSHIPS", image: "partnership.png" },
  { title: "Blocktrade.com Receives an Authorization as a Crypto-Asset Service Provider Under EU", date: "2D AGO", category: "NEWS", image: "mica.png" },
];

const NewsCard = ({ title, date, category, image }) => (
  <div className="bg-white shadow-md rounded-lg  overflow-hidden">
    <a href="/newdetail" className="block" alt="">
      <img src={image} alt={title} className="w-full h-40 object-cover" />
      <div className="p-4 ">
        <p className="text-blue-600 text-xs font-bold">{category} - {date}</p>
        <h3 className="text-lg font-semibold mt-2">{title}</h3>
      </div>
    </a>
  </div>
);

const NewsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [showFilter, setShowFilter] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8); // Ban đầu hiển thị 8 bài
  
  // Chỉ lọc danh sách tin tức phía dưới
  const filteredNews = selectedCategory === "ALL" ? newsData : newsData.filter(news => news.category === selectedCategory);

  // Xử lý hiển thị thêm tin tức
  const handleShowMore = () => {
    setVisibleCount(prevCount => prevCount + 4); // Mỗi lần bấm, hiển thị thêm 4 bài
  };
  
  return (
    <div className=" bg-custom-radial mx-auto p-6">
      <div className="mx-auto p-6 max-w-7xl">
        <h1 className="text-3xl font-bold mt-10 mb-4 text-white">Blocktrade.com Company News</h1>

        {/* Top News Section (KHÔNG THAY ĐỔI) */}
        <div className="grid md:grid-cols-3 gap-6 mt-5">
          <div className=" md:col-span-2 bg-white shadow-md rounded-lg">
            <NewsCard {...newsData[0]} />
          </div>
          <div className="space-y-4">
            {newsData.slice(1, 3).map((news, index) => (
              <NewsCard key={index} {...news} />
            ))}
          </div>
        </div>
        <div className="my-8">
          <hr className="border-t-2 border-gray-300" />
        </div>
        {/* Category Filter */}
        <div className="relative mt-6">
    <button 
      onClick={() => setShowFilter(!showFilter)} 
      className="text-blue-600 font-bold text-lg"
    >
      ^ {selectedCategory}
    </button>
    <span className="text-white font-bold text-lg"> Company News</span>
    {showFilter && (
      <div className="absolute bg-white shadow-lg p-4 rounded-lg mt-2 z-10">
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat, index) => (
            <button
              key={cat}
              onClick={() => {
                if (cat !== "Company News") { // Không chọn nếu là "Company News"
                  setSelectedCategory(cat);
                  setShowFilter(false);
                  setVisibleCount(Math.max(visibleCount, 8));
                }
              }}
              className={`px-1 py-1 border rounded-lg ${
                selectedCategory === cat ? "bg-black text-white" : "bg-gray-100"
              } ${cat === "Company News" ? "col-span-3 text-center font-bold bg-transparent text-gray-500 cursor-default text-sm" : "text-xs"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    )}
        </div>

        {/* Filtered News Grid (CHỈ PHẦN NÀY ĐƯỢC LỌC) */}
        <div className="grid md:grid-cols-4 gap-6 mt-6">
          {filteredNews.slice(0, visibleCount).map((news, index) => (
            <NewsCard key={index} {...news} />
          ))}
        </div>

        {/* Show More Button */}
        {filteredNews.length > visibleCount && (
          <div className="flex justify-center my-6">
            <div className="w-32">
              <ButtonComponent contentButton="Show More" onClick={handleShowMore} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
