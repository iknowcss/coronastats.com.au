from testfixtures import compare
import json
import pendulum
from doh_data_ingest.data_extractor import extract_from_html, extract_from_hypercube


class TestDataExtractor:
    def test_extract_during_dst(self):
        page_file = open("tests/fixture/doh-page-04-april.html", "r")
        html = page_file.read()
        location_data_map = extract_from_html(html)
        compare(location_data_map, {
            "act": ("04-04", "15:00", "+11:00", 93),
            "nsw": ("04-04", "15:00", "+11:00", 2493),
            "nt": ("04-04", "15:00", "+11:00", 25),
            "qld": ("04-04", "15:00", "+11:00", 900),
            "sa": ("04-04", "15:00", "+11:00", 407),
            "tas": ("04-04", "15:00", "+11:00", 79),
            "vic": ("04-04", "15:00", "+11:00", 1115),
            "wa": ("04-04", "15:00", "+11:00", 436),
            "australia": ("04-04", "15:00", "+11:00", 5548)
        })

    def test_extract_without_dst(self):
        page_file = open("tests/fixture/doh-page-05-april.html", "r")
        html = page_file.read()
        location_data_map = extract_from_html(html)
        compare(location_data_map, {
            "act": ("04-05", "15:00", "+10:00", 93),
            "nsw": ("04-05", "15:00", "+10:00", 2493),
            "nt": ("04-05", "15:00", "+10:00", 25),
            "qld": ("04-05", "15:00", "+10:00", 900),
            "sa": ("04-05", "15:00", "+10:00", 407),
            "tas": ("04-05", "15:00", "+10:00", 79),
            "vic": ("04-05", "15:00", "+10:00", 1115),
            "wa": ("04-05", "15:00", "+10:00", 436),
            "australia": ("04-05", "15:00", "+10:00", 5548)
        })

    def test_extract_new_format(self):
        page_file = open("tests/fixture/doh-page-20-april.html", "r")
        html = page_file.read()
        location_data_map = extract_from_html(html)
        compare(location_data_map, {
            "act": ("04-20", "06:00", "+10:00", 103),
            "nsw": ("04-20", "06:00", "+10:00", 2963),
            "nt": ("04-20", "06:00", "+10:00", 27),
            "qld": ("04-20", "06:00", "+10:00", 1019),
            "sa": ("04-20", "06:00", "+10:00", 435),
            "tas": ("04-20", "06:00", "+10:00", 192),
            "vic": ("04-20", "06:00", "+10:00", 1328),
            "wa": ("04-20", "06:00", "+10:00", 545),
            "australia": ("04-20", "06:00", "+10:00", 6612)
        })

    def test_hypercube_extract(self):
        page_file = open("tests/fixture/doh-hypercube-02-may.json", "r")
        now = pendulum.parse('2020-05-02T13:31:00+10:00')
        hypercube_data = json.loads(page_file.read())
        location_data_map = extract_from_hypercube(now, hypercube_data)
        compare(location_data_map, {
            "act": ("05-02", "13:31", "+10:00", 106),
            "nsw": ("05-02", "13:31", "+10:00", 3031),
            "nt": ("05-02", "13:31", "+10:00", 29),
            "qld": ("05-02", "13:31", "+10:00", 1034),
            "sa": ("05-02", "13:31", "+10:00", 438),
            "tas": ("05-02", "13:31", "+10:00", 223),
            "vic": ("05-02", "13:31", "+10:00", 1371),
            "wa": ("05-02", "13:31", "+10:00", 551),
            "australia": ("05-02", "13:31", "+10:00", 6783),
        })
