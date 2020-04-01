#!/bin/sh

runAs="$(docker info >/dev/null 2>&1 || echo 'sudo -E env PATH=$PATH:'$PATH)"

$runAs $@
