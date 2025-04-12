from pyspark.sql import SparkSession
from pyspark.sql.types import StringType, StructType, StructField, FloatType
from pyspark.sql.functions import from_json

spark = (
    SparkSession
    .builder
    .appName("test")
    .config('spark.jars.packages', 'org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0,ru.yandex.clickhouse:clickhouse-jdbc:0.3.2')
    # .config('spark.jars.packages', 'org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0,com.clickhouse:clickhouse-jdbc:0.6.0')
    .getOrCreate()
)
# Thiết lập mức log
spark.sparkContext.setLogLevel("WARN")  # Chỉ hiển thị WARN và ERROR
df = (
    spark
    .readStream
    .format('kafka')
    .option('kafka.bootstrap.servers', 'localhost:9092')
    .option('subscribe', 'coin_history_data')
    .option('startingOffsets', 'earliest')
    .load()
)

json_schema = StructType([
    StructField('Coin ID', StringType(), True),
    StructField('Close', FloatType(), True),
    StructField('Market_cap', FloatType(), True),
    StructField('Volume', StringType(), True),
    StructField('price_change_24h', FloatType(), True),
    StructField('circulating_supply', FloatType(), True),
    StructField('Timestamp', StringType(), True)    
])

df2 = df.withColumn('value', df['value'].cast('String')).select('value')
df3 = df2.withColumn('value', from_json(col='value', schema=json_schema)).selectExpr("value.*")  # Trích xuất tất cả các trường từ cột value
df4 = df3.distinct()

def data_output(df, batch_id):
    # driver = 'com.clickhouse.jdbc.ClickHouseDriver'
    driver = 'ru.yandex.clickhouse.ClickHouseDriver'
    username = 'default'
    password = '123456'
    host = 'localhost'
    port = '8124'
    url = f'jdbc:clickhouse://{host}:{port}'

    df = df.withColumnRenamed('Coin ID', 'coin_id')
    df = df.withColumnRenamed('Close', 'price')
    df = df.withColumnRenamed('Market_cap', 'market_cap')
    df = df.withColumnRenamed('Volume', 'volume_24h')
    df = df.withColumnRenamed('Timestamp', 'updated_date')
    (df
    .write
    .mode('append')
    .format('jdbc')
    .option('driver', driver)
    .option('url', url)
    .option('user', username)
    .option('password', password)
    .option('dbtable', 'blocktrade_track.market_data')
    .save()
    )
    print('Batch ID:', batch_id)
    print(df.show())

(
    df4
    .writeStream
    .foreachBatch(data_output)
    .trigger(processingTime='15 seconds')
    .option('checkpointLocation', 'checkpointLocation/checkpoint_dir_kafka')
    .start()
    .awaitTermination()  
)

# Dừng sau 120 giây
# query.awaitTermination(timeout=3600)  
# query.stop()
# print("Stream stopped after 60 minutes.")
# spark-submit --master local[*] --packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0,ru.yandex.clickhouse:clickhouse-jdbc:0.3.2 spark_app.py


