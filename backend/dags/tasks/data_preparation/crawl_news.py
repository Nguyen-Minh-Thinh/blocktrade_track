from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time 
from bs4 import BeautifulSoup
import clickhouse_connect

clickhouse_client = clickhouse_connect.get_client(
    host='localhost',
    port='8124',
    user='default',
    password='123456'
)

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

time.sleep(2)

body = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "tbody")))
rows = body.find_elements(By.TAG_NAME, "tr")
for row in rows:
    WebDriverWait(driver, 10).until(EC.presence_of_all_elements_located((By.TAG_NAME, "td")))
    cells = row.find_elements(By.TAG_NAME, "td")
    
    # Kiểm tra nếu có ít nhất 2 cell và thẻ <a> trong cell thứ 2
    if len(cells) > 1:
        elem_to_click = cells[1].find_elements(By.TAG_NAME, "a")
        # Nếu có thẻ <a>, lấy href của nó
        if elem_to_click:
            href = elem_to_click[0].get_attribute("href")
            symbol = elem_to_click[0].get_attribute("textContent") + 'USDT'
            # Check if symbol exists in db
            results = clickhouse_client.query(f"SELECT * FROM blocktrade_track.coins WHERE symbol='{symbol}'").result_rows
            print(results)
            if len(results) != 0:
                name_of_coin = elem_to_click[0].text
                print(f"Opening: {name_of_coin} with URL: {href}")

                # Mở URL trong một tab mới
                driver.execute_script(f"window.open('{href}', '_blank');")

                # Chuyển sang tab mới
                driver.switch_to.window(driver.window_handles[1])

                # Đợi một chút để trang tải
                time.sleep(2)
                # Cuộn xuống để load dữ liệu
                for i in range(6):
                    driver.execute_script("window.scrollBy(0, 300);")
                    time.sleep(0.5)  # Chờ một chút sau mỗi lần cuộn
                time.sleep(2)
                try:
                    print("Current URL:", driver.current_url)
                    news_container = WebDriverWait(driver, 10).until(
                        EC.presence_of_element_located((By.XPATH, '//*[@id="section-coin-news"]/div[2]/section/div/div[2]'))
                    )
                    # news_list = news_container.find_elements(By.TAG_NAME, 'div')[1].find_element(By.XPATH, './section').find_element(By.TAG_NAME, 'div')
                    # news_list = news_list.find_elements(By.TAG_NAME, 'div')[1]
                    news_list = news_container.find_elements(By.XPATH, './div')
                    print(len(news_list))
                    coin_id = results[0][0]
                    for news in news_list:
                        news_link = news.find_element(By.XPATH, './a').get_attribute('href')
                        text = news.find_element(By.XPATH, './a').text.splitlines()
                        title = text[0]
                        source_name = text[1]
                        updated_at = text[2]
                        
                        # print(text)
                        clickhouse_client.insert(table='blocktrade_track.news', data=[(title, news_link, source_name, updated_at, coin_id)], column_names=['title', 'news_link', 'source_name', 'updated_at', 'coin_id'])
                        # print(BeautifulSoup(news.get_attribute('outerHTML'), 'html.parser').prettify())
                        print('====================================================')
                    # # Lấy HTML của phần tin tức
                    # news_html = news_container.get_attribute("outerHTML")

                    # # Dùng BeautifulSoup để phân tích
                    # soup = BeautifulSoup(news_html, "html.parser")

                    # # In nội dung văn bản
                    # print("\nNews content:")
                    # print(soup.prettify())
                except Exception as e:
                    print("Không tìm thấy phần tử Coin-News:", e)
                    driver.quit()
                
                # Đóng tab mới
                driver.close()
                # Tiến hành các thao tác trên tab mới nếu cần
                

                # Chuyển lại tab cũ (tab đầu tiên)
                driver.switch_to.window(driver.window_handles[0])
    
    
    # time.sleep(2)
    # # Chờ phần tử Coin-News xuất hiện (tối đa 10 giây)
    # try:
    #     news_container = WebDriverWait(driver, 10).until(
    #         EC.presence_of_element_located((By.XPATH, '//*[@data-module-name="Coin-News"]'))
    #     )
    #      # Lấy HTML của phần tin tức
    #     news_html = news_container.get_attribute("outerHTML")

    #     # Dùng BeautifulSoup để phân tích
    #     soup = BeautifulSoup(news_html, "html.parser")

    #     # In nội dung văn bản
    #     print("\nNews content:")
    #     print(soup.prettify())
    # except Exception as e:
    #     print("Không tìm thấy phần tử Coin-News:", e)
    #     driver.quit()

    # Tìm danh sách tin tức
    # news_list = news_container.find_elements(By.XPATH, './div')[1]
    # news_list = news_container.find_elements(By.TAG_NAME, 'div')[1].find_element(By.TAG_NAME, 'section').find_element(By.TAG_NAME, 'div')

    # try:
    #     # news_list = news_list.find_element(By.XPATH, './section/div').find_elements(By.XPATH, './div')[1].find_elements(By.XPATH, './div')
    #     news_list = news_list.find_elements(By.TAG_NAME, 'div')[1].find_elements(By.TAG_NAME, 'div')
    #     for news in news_list:
    #         try:
    #             current_url = driver.current_url
    #             a_tag = news.find_element(By.XPATH, './a')
    #             news_link = a_tag.get_attribute('href')
    #             print(news_link)
    #             title = a_tag.text
    #             print(title.splitlines()) # Giữ nguyên dấu \n

    #         except Exception:
    #             print("Không tìm thấy thẻ 'a' trong một tin tức")

    # except Exception as e:
    #     print("Lỗi khi truy cập danh sách tin:", e)
    # driver.back()
    # driver.execute_script("window.scrollBy(0, 70);")
    time.sleep(3)








