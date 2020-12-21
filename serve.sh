#!/usr/bin/env bash

main=$(cat package.json | jq .main -r)

http-server . -p 4200
