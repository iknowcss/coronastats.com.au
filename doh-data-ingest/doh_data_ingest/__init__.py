import requests
from .data_extractor import extract_from_html
from .data_updater import DataUpdater

DATA_URL = "https://www.health.gov.au/news/health-alerts" \
           "/novel-coronavirus-2019-ncov-health-alert/coronavirus-covid-19-current-situation-and-case-numbers"


def main():
    try:
        print('Fetch data from:', DATA_URL)
        response = requests.get(DATA_URL)
    except Exception as err:
        print('ERROR: Failed to fetch data')
        print(err)
        raise err

    try:
        print('Extract data from HTML with content-length:', len(response.text))
        location_data_map = extract_from_html(response.text)
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
