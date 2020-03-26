#!/bin/sh
set -eu

tmp_path="$(pwd)/.tmp"
output_path="$tmp_path/raw_tf_apply_output"

mkdir -p "$tmp_path"

(
  cd infra
  terraform init
  terraform apply
  exit 0
  terraform apply -auto-approve -no-color \
    | tee "$output_path"
)

grep -E -o 'website_bucket = [^$]+' "$output_path" \
  | awk -F' = ' '{print $2}' \
  > "$tmp_path/website_bucket"
