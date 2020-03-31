import boto3
import json
from botocore.exceptions import ClientError

class DataUpdater:
    def __init__(self, **kwargs):
        self.resource = boto3.resource('s3')
        self.options = {
            "bucket": kwargs["bucket"],
            "key_prefix": kwargs["key_prefix"],
        }

    def push_new_state_entry(self, state, entry):
        key = f"{self.options['key_prefix']}/totalCaseCount_{state}.json"
        current = None
        print(f"Fetch object", key)
        try:
            current = json.loads(self.resource.Object(self.options["bucket"], key).get()["Body"].read().decode())
        except ClientError:
            print("Object does not exist; stop")
            return
        except:
            print("Failed to read object data")
            return
        print('current:', current)
