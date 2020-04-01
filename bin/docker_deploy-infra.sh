#!/bin/sh
set -euv

tmp_path="$(pwd)/.tmp"
output_path="$tmp_path/raw_tf_apply_output"
data_updater_source_code_path="$(pwd)/doh-data-ingest/dist/lambda.zip"

# Ensure things exist
if [ ! -f "$data_updater_source_code_path" ]; then
  echo "data-updater lambda source code does not exist at path: $data_updater_source_code_path"
  exit 1
fi

mkdir -p "$tmp_path"
echo "test"
(
  cd infra
  terraform init
  terraform apply -no-color \
    -var data_updater_source_code_path="$data_updater_source_code_path"
    #| tee "$output_path"
)

#grep -E -o 'website_bucket = [^$]+' "$output_path" \
#  | awk -F' = ' '{print $2}' \
#  > "$tmp_path/website_bucket"
