#!/bin/bash

CHECK_INTERVAL=5

check_elasticsearch() {
  # Use curl to get both the HTTP status code and the response body
  HTTP_STATUS=$(curl -u $ELASTICSEARCH_USERNAME:$ELASTICSEARCH_PASSWORD -s -o /dev/null -w "%{http_code}" "$ELASTICSEARCH_HOST:$ELASTICSEARCH_PORT/_cluster/health")

  # If HTTP status code is not 200, Elasticsearch might not be running or reachable
  if [ "$HTTP_STATUS" -ne 200 ]; then
    echo "Elasticsearch returned HTTP status $HTTP_STATUS"
    return 1  # Elasticsearch is not ready
  else
    echo "Elasticsearch is ready"
    return 0
  fi
}

while true; do
  check_elasticsearch

  if [ $? -eq 0 ]; then
    echo "Elasticsearch is ready!"
    break
  else
    echo "Elasticsearch is not ready. Retrying in $CHECK_INTERVAL seconds..."
    sleep $CHECK_INTERVAL
  fi
done

node ./src/index.js
