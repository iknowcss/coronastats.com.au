from moto import mock_s3
from doh_data_ingest.data_updater import push_new_state_entry

@mock_s3
def test_push_new_state_entry():
    push_new_state_entry("nsw", ("03-29", "15:30", "+11:00", 72))
    pass
