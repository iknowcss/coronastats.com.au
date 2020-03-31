#!/bin/sh

set -ev

(
  cd doh-data-ingest
#  python3 "$HOME/.poetry/bin/poetry" $@
  poetry $@
)
