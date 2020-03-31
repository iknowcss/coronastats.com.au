#!/bin/sh

set -eu

python -c "import doh_data_ingest; doh_data_ingest.main()"
