import boto3
import json
from moto import mock_s3
from testfixtures import compare
from doh_data_ingest.data_updater import DataUpdater

STATE_CODE = "nsw"
BUCKET = "mybucket"
KEY_PREFIX = "/data"
KEY = f"{KEY_PREFIX}/totalCaseCount_{STATE_CODE}.json"

@mock_s3
class TestDataUpdater:
    @staticmethod
    def setup_s3_object(data_dict):
        resource = boto3.resource('s3')
        resource.create_bucket(Bucket=BUCKET)
        original = resource.Object(BUCKET, KEY)
        original.put(Body=json.dumps(data_dict))

    def test_apply_state_entry_noop(self):
        # Arrange
        self.setup_s3_object({
            "raw": [
                ["03-28", "06:30", "+11:00", 1617],
                ["03-29", "06:30", "+11:00", 1791],
            ]
        })

        # Act
        DataUpdater(
            bucket=BUCKET,
            key_prefix=KEY_PREFIX
        ).apply_state_entry(STATE_CODE, ("03-29", "06:30", "+11:00", 1791))

        # Assert
        resource = boto3.resource('s3')
        updated = resource.Object(BUCKET, KEY)
        updated_dict = json.loads(updated.get()["Body"].read().decode())
        compare(updated_dict, {
            "raw": [
                ["03-28", "06:30", "+11:00", 1617],
                ["03-29", "06:30", "+11:00", 1791],
            ]
        })

    def test_apply_state_entry_24_hours(self):
        # Arrange
        self.setup_s3_object({
            "raw": [
                ["03-28", "06:30", "+11:00", 1617],
                ["03-29", "06:30", "+11:00", 1791],
            ]
        })

        # Act
        DataUpdater(
            bucket=BUCKET,
            key_prefix=KEY_PREFIX
        ).apply_state_entry(STATE_CODE, ("03-30", "06:30", "+11:00", 1923))

        # Assert
        resource = boto3.resource('s3')
        updated = resource.Object(BUCKET, KEY)
        updated_dict = json.loads(updated.get()["Body"].read().decode())
        compare(updated_dict, {
            "raw": [
                ["03-28", "06:30", "+11:00", 1617],
                ["03-29", "06:30", "+11:00", 1791],
                ["03-30", "06:30", "+11:00", 1923],
            ]
        })

    def test_apply_state_entry_identical_less_than_18_hours(self):
        # Arrange
        self.setup_s3_object({
            "raw": [
                ["03-28", "06:30", "+11:00", 1617],
                ["03-29", "06:30", "+11:00", 1791],
            ]
        })

        # Act
        DataUpdater(
            bucket=BUCKET,
            key_prefix=KEY_PREFIX
        ).apply_state_entry(STATE_CODE, ("03-29", "15:00", "+11:00", 1791))

        # Assert
        resource = boto3.resource('s3')
        updated = resource.Object(BUCKET, KEY)
        updated_dict = json.loads(updated.get()["Body"].read().decode())
        compare(updated_dict, {
            "raw": [
                ["03-28", "06:30", "+11:00", 1617],
                ["03-29", "06:30", "+11:00", 1791],
            ]
        })

    def test_apply_state_entry_identical_gte_18_hours(self):
        # Arrange
        self.setup_s3_object({
            "raw": [
                ["03-28", "06:30", "+11:00", 1617],
                ["03-29", "06:30", "+11:00", 1791],
            ]
        })

        # Act
        DataUpdater(
            bucket=BUCKET,
            key_prefix=KEY_PREFIX
        ).apply_state_entry(STATE_CODE, ("03-30", "06:00", "+11:00", 1791))

        # Assert
        resource = boto3.resource('s3')
        updated = resource.Object(BUCKET, KEY)
        updated_dict = json.loads(updated.get()["Body"].read().decode())
        compare(updated_dict, {
            "raw": [
                ["03-28", "06:30", "+11:00", 1617],
                ["03-29", "06:30", "+11:00", 1791],
                ["03-30", "06:00", "+11:00", 1791],
            ]
        })
