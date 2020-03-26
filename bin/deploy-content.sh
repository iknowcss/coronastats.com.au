#!/bin/sh
set -eu

tmp_path="$(pwd)/.tmp"
website_bucket="$(cat "$tmp_path/website_bucket")"

aws s3 sync dist/ "s3://$website_bucket/" \
  --delete \
  --cache-control 'max-age=60'

echo "Done"
