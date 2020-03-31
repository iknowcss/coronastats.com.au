#!/bin/sh

set -eu

export AWS_ACCESS_KEY_ID=abc
export AWS_SECRET_ACCESS_KEY=123

ptw $@
