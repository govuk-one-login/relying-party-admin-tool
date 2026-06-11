#!/bin/bash

EXIT_CODE=0
echo "Running playwright UI tests"
pushd /ui-tests
./run-tests.sh
EXIT_CODE=$?
popd
exit $EXIT_CODE
