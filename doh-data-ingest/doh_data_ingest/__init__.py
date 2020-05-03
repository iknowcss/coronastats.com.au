import requests
import pendulum
from .qlik_service import fetch_hypercube_data
from .data_extractor import extract_from_hypercube
from .data_updater import DataUpdater

DATA_URL = "wss://covid19-data.health.gov.au/app"
DOCUMENT_ID = "e8635e3f-b339-4ab3-a9de-b4e3b15c6bbc"

def main():
    try:
        print('Fetch data from:', DATA_URL)
        data = fetch_hypercube_data(DATA_URL, DOCUMENT_ID)
    except Exception as err:
        print('ERROR: Failed to fetch data')
        print(err)
        raise err

    try:
        print('Extract data from WS hypercube')
        location_data_map = extract_from_hypercube(pendulum.now('Australia/Sydney'), data)
    except Exception as err:
        print('ERROR: Failed to extract data')
        print(err)
        raise err

    updater = DataUpdater(
        bucket="coronaforecast.com.au",
        key_prefix="data",
    )
    for item in location_data_map.items():
        updater.apply_state_entry(item[0], item[1])


def lambda_handler(event, lambda_context):
    main()
