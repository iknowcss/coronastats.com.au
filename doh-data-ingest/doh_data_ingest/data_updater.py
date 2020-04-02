import boto3
import json
from datetime import datetime
from botocore.exceptions import ClientError

IGNORE_IDENTICAL_COUNT_CUTOFF_SECONDS = 18 * 3600 # 18 hours
CLOUDFRONT_CACHE_SECONDS = 60
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


def diff_entry_seconds(entry_a, entry_b):
    return (get_entry_time(entry_a) - get_entry_time(entry_b)).total_seconds()


def diff_entry_count(entry_a, entry_b):
    return get_entry_count(entry_a) - get_entry_count(entry_b)


class DataUpdater:
    def __init__(self, **kwargs):
        self.resource = boto3.resource('s3', region_name="ap-southeast-2")
        self.options = {
            "bucket": kwargs["bucket"],
            "key_prefix": kwargs["key_prefix"],
        }

    def _get_current(self, state):
        bucket = self.options["bucket"]
        key = f"{self.options['key_prefix']}/totalCaseCount_{state}.json"
        try:
            print(f"Fetch object s3://{bucket}/{key}")
            s3_object = self.resource.Object(bucket, key)
            object_dict = json.loads(s3_object.get()["Body"].read().decode())
            return s3_object, object_dict
        except ClientError as e:
            print("Object does not exist; stop", e)
            return None, None
        except Exception as e:
            print("Failed to read object data", e)
            raise e

    def apply_state_entry(self, state, entry):
        s3_object, object_dict = self._get_current(state)
        if object_dict is None:
            return

        if len(object_dict["raw"]) > 0:
            last_entry = object_dict["raw"][-1]
        else:
            last_entry = None

        # If the last entry has the same count as the new entry and it was made recently, skip the update
        if last_entry is not None \
                and diff_entry_count(entry, last_entry) == 0 \
                and diff_entry_seconds(entry, last_entry) < IGNORE_IDENTICAL_COUNT_CUTOFF_SECONDS:
            print("[~] Skip update:", state)
            return

        # If the last entry has the same time as the new entry and the
        if last_entry is not None \
                and diff_entry_seconds(entry, last_entry) == 0 \
                and diff_entry_count(entry, last_entry) != 0:
            update_message = "[@] Update existing entry:"
            object_dict["raw"][-1] = entry
        else:
            update_message = "[+] Insert new entry:"
            object_dict["raw"].append(entry)

        # Write changes to S3
        try:
            s3_object.put(
                Body=json.dumps(object_dict),
                CacheControl=f"max-age={CLOUDFRONT_CACHE_SECONDS}",
            )
            print(update_message, state)
        except Exception as e:
            print("[!] Failed to write object data")
            print(e)
            raise
