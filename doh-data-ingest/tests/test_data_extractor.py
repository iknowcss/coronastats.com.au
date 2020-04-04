from testfixtures import compare
from doh_data_ingest.data_extractor import extract_from_html

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
