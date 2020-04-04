#!/bin/bash
set -eu

tmp_path="$(pwd)/.tmp"
website_bucket="$(cat "$tmp_path/website_bucket")"

source .env
export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY
export AWS_PROFILE

aws s3 sync dist/ "s3://$website_bucket/" \
  --cache-control 'max-age=60' \
  --delete \
  --exclude 'data/*'

echo "Done"
