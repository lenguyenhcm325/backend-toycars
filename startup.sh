#!/bin/bash

CHECK_INTERVAL=5

check_elasticsearch() {
  # Use curl to get both the HTTP status code and the response body
  RESPONSE=$(curl --silent --write-out "HTTPSTATUS:%{http_code}" "$ELASTICSEARCH_HOST:$ELASTICSEARCH_PORT/_cluster/health")
  
  # Extract the HTTP status code from the response
  HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

  # Extract the response body (by removing the HTTP status code from the end)
  BODY=$(echo $RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')

  # If HTTP status code is not 200, Elasticsearch might not be running or reachable
  if [ "$HTTP_STATUS" -ne 200 ]; then
    echo "Elasticsearch returned HTTP status $HTTP_STATUS"
    return 1  # Elasticsearch is not ready
  fi

  # If the response is valid JSON, parse the status; otherwise, consider Elasticsearch not ready
  STATUS=$(echo $BODY | jq -r '.status' 2>/dev/null)
  if [[ $? -ne 0 ]]; then
    echo "Elasticsearch did not return valid JSON"
    return 1  # Elasticsearch is not ready
  fi

  # Check the cluster status
  if [[ "$STATUS" == "green" || "$STATUS" == "yellow" ]]; then
    return 0  # Elasticsearch is ready
  else
    echo "Elasticsearch cluster status is $STATUS"
    return 1  # Elasticsearch is not ready
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
