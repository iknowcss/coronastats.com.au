import boto3
import json
from moto import mock_s3
from testfixtures import compare
from doh_data_ingest.data_updater import DataUpdater

STATE_CODE = "nsw"
BUCKET = "mybucket"
KEY_PREFIX = "/data"
KEY = f"{KEY_PREFIX}/totalCaseCount_{STATE_CODE}.json"

resource = boto3.resource('s3')

@mock_s3
class TestDataUpdater:
    @staticmethod
    def setup_initial_state(data_dict):
        resource.create_bucket(Bucket=BUCKET)
        original = resource.Object(BUCKET, KEY)
        original.put(Body=json.dumps(data_dict))

    @staticmethod
    def apply_entry(entry):
        DataUpdater(bucket=BUCKET, key_prefix=KEY_PREFIX).apply_state_entry(STATE_CODE, entry)

    @staticmethod
    def get_current_state():
        updated = resource.Object(BUCKET, KEY)
        return json.loads(updated.get()["Body"].read().decode())

    def test_apply_state_entry_noop(self):
        # Arrange
        self.setup_initial_state({
            "raw": [
                ["03-28", "06:30", "+11:00", 1617],
                ["03-29", "06:30", "+11:00", 1791],
            ]
        })

        # Act
        self.apply_entry(("03-29", "06:30", "+11:00", 1791))

        # Assert
        compare(self.get_current_state(), {
            "raw": [
                ["03-28", "06:30", "+11:00", 1617],
                ["03-29", "06:30", "+11:00", 1791],
            ]
        })

    def test_apply_state_entry_24_hours(self):
        # Arrange
        self.setup_initial_state({
            "raw": [
                ["03-28", "06:30", "+11:00", 1617],
                ["03-29", "06:30", "+11:00", 1791],
            ]
        })

        # Act
        self.apply_entry(("03-30", "06:30", "+11:00", 1923))

        # Assert
        compare(self.get_current_state(), {
            "raw": [
                ["03-28", "06:30", "+11:00", 1617],
                ["03-29", "06:30", "+11:00", 1791],
                ["03-30", "06:30", "+11:00", 1923],
            ]
        })

    def test_apply_state_entry_identical_less_than_18_hours(self):
        # Arrange
        self.setup_initial_state({
            "raw": [
                ["03-28", "06:30", "+11:00", 1617],
                ["03-29", "06:30", "+11:00", 1791],
            ]
        })

        # Act
        self.apply_entry(("03-29", "15:00", "+11:00", 1791))

        # Assert
        compare(self.get_current_state(), {
            "raw": [
                ["03-28", "06:30", "+11:00", 1617],
                ["03-29", "06:30", "+11:00", 1791],
            ]
        })

    def test_apply_state_entry_identical_gte_18_hours(self):
        # Arrange
        self.setup_initial_state({
            "raw": [
                ["03-28", "06:30", "+11:00", 1617],
                ["03-29", "06:30", "+11:00", 1791],
            ]
        })

        # Act
        self.apply_entry(("03-30", "06:00", "+11:00", 1791))

        # Assert
        compare(self.get_current_state(), {
            "raw": [
                ["03-28", "06:30", "+11:00", 1617],
                ["03-29", "06:30", "+11:00", 1791],
                ["03-30", "06:00", "+11:00", 1791],
            ]
        })

    def test_apply_state_entry_same_time_new_value(self):
        # Arrange
        self.setup_initial_state({
            "raw": [
                ["03-28", "06:30", "+11:00", 1617],
                ["03-29", "06:30", "+11:00", 1791],
            ]
        })

        # Act
        self.apply_entry(("03-29", "06:30", "+11:00", 1000))

        # Assert
        compare(self.get_current_state(), {
            "raw": [
                ["03-28", "06:30", "+11:00", 1617],
                ["03-29", "06:30", "+11:00", 1000],
            ]
        })

    def test_apply_state_add_first_entry(self):
        # Arrange
        self.setup_initial_state({
            "raw": []
        })

        # Act
        self.apply_entry(("03-29", "06:30", "+11:00", 1791))

        # Assert
        compare(self.get_current_state(), {
            "raw": [
                ["03-29", "06:30", "+11:00", 1791],
            ]
        })
