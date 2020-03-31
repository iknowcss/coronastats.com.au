import boto3
import json
from moto import mock_s3
from testfixtures import compare
from doh_data_ingest.data_updater import DataUpdater

MOCK_DATA = json.dumps({
  "raw": [
    ["03-28", "06:30", "+11:00", 1617],
    ["03-29", "06:30", "+11:00", 1791]
  ]
})

@mock_s3
class TestDataUpdater:
    def test_push_new_state_entry(self):
        bucket = "mybucket"
        key = "/data/totalCaseCount_nsw.json"
        resource = boto3.resource('s3')
        resource.create_bucket(Bucket=bucket)
        original = resource.Object(bucket, key)
        original.put(Body=json.dumps(MOCK_DATA).encode())

        DataUpdater(
            bucket=bucket,
            key_prefix="/data"
        ).push_new_state_entry("nsw", ("03-29", "15:30", "+11:00", 72))
        #
        # compare(json.loads(client.get_object(
        #     Bucket=bucket,
        #     Key=key,
        #     Body=MOCK_DATA
        # ).read().decode('utf-8')), {
        #     "raw": [
        #         ["03-28", "06:30", "+11:00", 1617],
        #         ["03-29", "06:30", "+11:00", 1791]
        #     ]
        # })

