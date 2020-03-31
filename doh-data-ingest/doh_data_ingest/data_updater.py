import os
import boto3
import json
from datetime import datetime
from botocore.exceptions import ClientError

IGNORE_IDENTICAL_COUNT_CUTOFF_SECONDS = 18 * 3600 # 18 hours
ENTRY_TUPLE = {
    "date": 0,
    "time": 1,
    "tz": 2,
    "count": 3,
}

def get_entry_count(entry):
    return entry[ENTRY_TUPLE["count"]]

def get_entry_time(entry):
    entry_date = entry[ENTRY_TUPLE["date"]]
    entry_time = entry[ENTRY_TUPLE["time"]]
    entry_tz = entry[ENTRY_TUPLE["tz"]]
    return datetime.strptime(
        f'2020-{entry_date}T{entry_time}:00{entry_tz}',
        '%Y-%m-%dT%H:%M:%S%z',
    )

class DataUpdater:
    def __init__(self, **kwargs):
        self.resource = boto3.resource('s3', region_name="ap-southeast-2")
        self.options = {
            "bucket": kwargs["bucket"],
            "key_prefix": kwargs["key_prefix"],
        }

    def apply_state_entry(self, state, entry):
        bucket = self.options["bucket"]
        key = f"{self.options['key_prefix']}/totalCaseCount_{state}.json"
        s3_object = None
        object_dict = None
        try:
            print(f"Fetch object s3://{bucket}/{key}")
            s3_object = self.resource.Object(bucket, key)
            object_dict = json.loads(s3_object.get()["Body"].read().decode())
        except ClientError as e:
            print("Object does not exist; stop", e)
            return
        except Exception as e:
            print("Failed to read object data", e)
            return

        last_entry = object_dict["raw"][-1]
        if get_entry_count(entry) == get_entry_count(last_entry) and (get_entry_time(entry) - get_entry_time(last_entry)).total_seconds() < IGNORE_IDENTICAL_COUNT_CUTOFF_SECONDS:
            print("Skip update")
            return
        object_dict["raw"].append(entry)
        try:
            print("Put updated object")
            s3_object.put(Body=json.dumps(object_dict))
        except:
            print("Failed to write object data")
            raise