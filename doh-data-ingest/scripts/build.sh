#!/bin/sh

set -ev

build_path="$PWD/.tmp/build"
target_path="$PWD/dist"

rm -rf "$build_path"
mkdir -p "$build_path"
rm -rf "$target_path"
mkdir -p "$target_path"
pip install -r requirements.txt -t "$build_path"
cp -r doh_data_ingest "$build_path"

(
  cd "$build_path"
  zip -q -9 -r "$target_path/lambda.zip" * -x \*pycache* \*.dist-info*
)

rm -rf "$build_path"
