from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import csv 


# Mở trình duyệt
driver = webdriver.Chrome()
driver.get("https://coinmarketcap.com/all/views/all/")
time.sleep(2)  # Đợi trang load ban đầu

# Scroll chậm rãi từng đoạn
last_height = driver.execute_script("return document.body.scrollHeight")
stopScrolling = 0

while True:
    stopScrolling += 1
    driver.execute_script("window.scrollBy(0, 300);")  # Cuộn xuống 40px mỗi lần
    time.sleep(0.5)  # Dừng lại để dữ liệu tải lên
    
    # Kiểm tra chiều cao mới sau khi cuộn
    new_height = driver.execute_script("return document.body.scrollHeight")
    
    if stopScrolling > 50:  # Giới hạn số lần cuộn để tránh vòng lặp vô hạn
        break

time.sleep(2)  # Đợi tải hết dữ liệu còn lại

# Lấy lại tất cả các hàng trong bảng sau khi cuộn
body = driver.find_element(By.TAG_NAME, 'tbody')
rows = body.find_elements(By.TAG_NAME, "tr")

results = []
columns = ['rank', 'name', 'symbol', 'market_cap', 'price', 'circulating_supply', 'volume(24h)', '%1h', '%24h', r'%7d', 'image_url']
results.append(columns)
# Duyệt từng dòng và lấy dữ liệu
for row in rows:
    cells = row.find_elements(By.TAG_NAME, "td")  # Lấy tất cả các ô trong dòng
    cell_texts = [cell.get_attribute("innerText").strip() for cell in cells]
    cell_texts.pop()
    image_url = cells[1].find_element(By.TAG_NAME, 'img').get_attribute('src')
    cell_texts.append(image_url)
    results.append(cell_texts)
    
with open('coin_data.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerows(results)
driver.quit()  # Đóng trình duyệt khi hoàn tất
