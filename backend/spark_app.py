from pyspark.sql import SparkSession
from pyspark.sql.types import StringType, StructType, StructField, FloatType
from pyspark.sql.functions import from_json
# from kafka.admin import KafkaAdminClient, NewTopic
# from kafka.errors import TopicAlreadyExistsError

# KAFKA_BROKER = "kafka:29092"  
# TOPIC_NAME = "coin_history_data"

# def ensure_topic_exists():
#     admin_client = KafkaAdminClient(bootstrap_servers=KAFKA_BROKER)
    
#     # Lấy danh sách các topic hiện có
#     existing_topics = admin_client.list_topics()
    
#     if TOPIC_NAME in existing_topics:
#         print(f"Topic '{TOPIC_NAME}' already exists!")
#     else:
#         print(f"Create topic '{TOPIC_NAME}'...")
#         topic = NewTopic(name=TOPIC_NAME, num_partitions=1, replication_factor=1)
#         try:
#             admin_client.create_topics([topic])
#             print(f"Topic '{TOPIC_NAME}' created successfully.")
#         except TopicAlreadyExistsError:
#             print(f"Topic '{TOPIC_NAME}' already exists!")

#     admin_client.close()


# ensure_topic_exists()

spark = (
    SparkSession
    .builder
    .appName("test")
    .config('spark.jars.packages', 'org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0,ru.yandex.clickhouse:clickhouse-jdbc:0.3.2')
    .getOrCreate()
)
# Thiết lập mức log
spark.sparkContext.setLogLevel("WARN")  # Chỉ hiển thị WARN và ERROR
df = (
    spark
    .readStream
    .format('kafka')
    .option('kafka.bootstrap.servers', 'kafka:29092')
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
    driver = 'ru.yandex.clickhouse.ClickHouseDriver'
    username = 'default'
    password = ''
    host = 'host.docker.internal'
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
query = (
    df4
    .writeStream
    .foreachBatch(data_output)
    .trigger(processingTime='30 seconds')
    .option('checkpointLocation', 'checkpointLocation/checkpoint_dir_kafka')
    .start()
)
# Dừng sau 120 giây
query.awaitTermination(timeout=3600)  
query.stop()
print("Stream stopped after 60 minutes.")
# spark-submit --master local[*] --conf spark.streaming.stopGracefullyOnShutdown=true --conf spark.executor.heartbeatInterval=120 --packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0,ru.yandex.clickhouse:clickhouse-jdbc:0.3.2 spark_app.py
