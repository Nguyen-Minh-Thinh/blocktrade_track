from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from airflow.operators.bash_operator import BashOperator
# from airflow.providers.apache.spark.operators.spark_submit import SparkSubmitOperator 
from datetime import datetime, timedelta

default_args={
    'depends_on_past': False,
    'start_date': datetime(2025, 3, 25),  # Ngày bắt đầu chạy DAG
    'email_on_failure': False,  # Không gửi email khi DAG thất bại
    'email_on_retry': False,  # Không gửi email khi DAG retry
    'retries': 1,  # Số lần thử lại nếu task fail
    'retry_delay': timedelta(seconds=5),  # Thời gian delay giữa các lần retry
}

with DAG(
    'fetch_data_dag',
    default_args=default_args,
    schedule_interval='@daily',
    catchup=False
) as DAG:
    create_table = BashOperator(
        task_id='create_table',
        bash_command='python /opt/airflow/dags/tasks/create_table.py'
    )

    load_coins = BashOperator(
        task_id='load_coins_to_clickhouse',
        bash_command='python /opt/airflow/dags/tasks/data_preparation/load_coins.py'
    )

    filter_coins = BashOperator(
        task_id='filter_coins',
        bash_command='python /opt/airflow/dags/tasks/data_preparation/filter_coins.py'
    )

    load_market_data_to_kafka = BashOperator(
        task_id='load_market_data_to_kafka',
        bash_command='python /opt/airflow/dags/tasks/load_market_data_to_kafka.py'
    )

    create_table >> load_coins >> filter_coins >> load_market_data_to_kafka