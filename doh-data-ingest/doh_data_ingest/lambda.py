import doh_data_ingest


def handler(event, lambda_context):
    doh_data_ingest.main()
