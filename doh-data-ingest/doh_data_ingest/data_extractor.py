import sys
import math
import re
from bs4 import BeautifulSoup
import pendulum

LOCATION_CODE_MAP = {
    'Australian Capital Territory': 'act',
    'New South Wales': 'nsw',
    'Northern Territory': 'nt',
    'Queensland': 'qld',
    'South Australia': 'sa',
    'Tasmania': 'tas',
    'Victoria': 'vic',
    'Western Australia': 'wa',
    'Total**': 'australia',
    'Total': 'australia',
}
MONTH_MAP = {
    'january': 1,
    'february': 2,
    'march': 3,
    'april': 4,
    'may': 5,
    'june': 6,
    'july': 7,
    'august': 8,
    'september': 9,
    'october': 10,
    'november': 11,
    'december': 12,
}


def format_time_match(time_match):
    hour = int(time_match[1])
    if time_match[3] == 'pm':
        hour += 12
    return f'{str(hour).zfill(2)}:{time_match[2]}'


def extract_from_html(page_html):
    print('Parse HTML')
    soup = BeautifulSoup(page_html, 'html.parser')

    print('Extract COVID-19 block')
    covid_block = soup.find_all(about='/block/covid-19')[0]

    print('Extract time')
    time_re = re.compile('([01]?[0-9]):([0-5][0-9])([ap]m)')

    au_callouts = covid_block.find_all(class_='au-callout')
    callout_text = au_callouts[0].text.strip().lower()
    time_match = time_re.search(callout_text)
    if not(time_match):
        print('Failed to find time')
        sys.exit(1)
    time_string = format_time_match(time_match)

    print('Extract date')
    date_re = re.compile('([123]?[0-9])\\s+([a-z]+)\\s+(20[0-9]{2})', re.I)
    date_match = date_re.search(callout_text)
    if not(date_match):
        print('Failed to find date')
        sys.exit(1)

    parsed_date = pendulum.datetime(
        int(date_match[3]),
        MONTH_MAP[date_match[2]],
        int(date_match[1]),
        int(time_match[1]) if time_match[3] == 'am' else int(time_match[1]) + 12,
        tz='Australia/Sydney',
    )
    date_string = parsed_date.format('MM-DD')
    timezone_string = '+' + str(math.floor(parsed_date.offset / 3600)) + ':00'

    print('Extract location data')
    location_data_map = {}
    health_tables = covid_block.find_all(class_='health-table__responsive')
    for row in health_tables[0].find_all('tr'):
        tds = row.find_all('td')
        if len(tds) < 2:
            continue
        p = re.compile('[^0-9]+')
        loc = tds[0].text.strip()
        loc_code = LOCATION_CODE_MAP[loc]
        count = int(p.sub('', tds[1].text.strip()))
        location_data_map[loc_code] = (date_string, time_string, timezone_string, count)

    return location_data_map
