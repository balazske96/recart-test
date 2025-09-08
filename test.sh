#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Shopify Webhook Test Runner${NC}"
echo "=============================="
echo ""

# Function to check if a port is in use
is_port_in_use() {
  lsof -i:$1 > /dev/null 2>&1
  return $?
}

# Function to check if a Docker container is running
is_container_running() {
  if [ "$(docker ps -q -f name=$1)" ]; then
    return 0
  else
    return 1
  fi
}

# Step 1: Check if Docker is running
echo -e "${YELLOW}Checking if Docker is running...${NC}"
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Docker is not running. Please start Docker and try again.${NC}"
  exit 1
fi
echo -e "${GREEN}Docker is running.${NC}"
echo ""

# Step 2: Check if Docker containers are running, start them if not
echo -e "${YELLOW}Checking if required containers are running...${NC}"
if ! is_container_running "recart_db" || ! is_container_running "recart_redis"; then
  echo "Starting Docker containers..."
  docker-compose up -d
  
  # Wait for MySQL to be ready
  echo "Waiting for MySQL to be ready..."
  while ! docker exec recart_db mysqladmin ping -h localhost -u recart_user -precart_password --silent; do
    echo -n "."
    sleep 1
  done
  echo -e "\n${GREEN}MySQL is ready.${NC}"
else
  echo -e "${GREEN}Required containers are already running.${NC}"
fi
echo ""

# Step 3: Check if the NestJS application is running
echo -e "${YELLOW}Checking if the NestJS application is running...${NC}"
if ! is_port_in_use 3000; then
  echo "Starting NestJS application..."
  
  # Start the app in the background
  npm run start:dev > app.log 2>&1 &
  APP_PID=$!
  
  # Save the PID to a file for later cleanup
  echo $APP_PID > .app.pid
  
  # Wait for the app to start
  echo "Waiting for the application to start..."
  while ! is_port_in_use 3000; do
    echo -n "."
    sleep 1
  done
  echo -e "\n${GREEN}Application is running.${NC}"
  
  # Give the app a moment to fully initialize
  sleep 2
else
  echo -e "${GREEN}NestJS application is already running.${NC}"
fi
echo ""

# Step 4: Run the HTTP tests using curl
echo -e "${YELLOW}Running webhook HTTP tests...${NC}"
echo ""

# Function to run a test and display the result
run_test() {
  TEST_NAME=$1
  ENDPOINT=$2
  HEADERS=$3
  PAYLOAD=$4
  EXPECTED_STATUS=$5
  
  echo -e "${YELLOW}Running test: ${TEST_NAME}${NC}"
  
  # Run the curl command with all the headers from the array
  HTTP_STATUS=$(curl -s -o response.txt -w "%{http_code}" \
    -X POST ${ENDPOINT} \
    ${HEADERS} \
    -d "${PAYLOAD}")
  
  # Check if the status matches the expected status
  if [ "$HTTP_STATUS" -eq "$EXPECTED_STATUS" ]; then
    echo -e "${GREEN}✓ Test passed (Status: ${HTTP_STATUS})${NC}"
    RESPONSE=$(cat response.txt)
    echo "Response: ${RESPONSE}"
  else
    echo -e "${RED}✗ Test failed (Expected: ${EXPECTED_STATUS}, Got: ${HTTP_STATUS})${NC}"
    RESPONSE=$(cat response.txt)
    echo "Response: ${RESPONSE}"
  fi
  echo ""
}

# Test 1: Successful webhook with valid HMAC
echo -e "${YELLOW}Test 1: Successful webhook with valid HMAC${NC}"
run_test "Valid Cart Create Webhook" \
  "http://localhost:3000/webhooks" \
  "-H 'Content-Type: application/json' -H 'X-Shopify-Topic: carts/create' -H 'X-Shopify-Shop-Domain: test-shop.myshopify.com' -H 'X-Shopify-Hmac-Sha256: lBwXX0JQhj60+OtuIlQV5nN6+7jcniQETbmX28Wk2ZE='" \
  '{"id":"123456789","cart_token":"abc123","shop_id":"test-shop.myshopify.com","items":[{"product_id":"123","quantity":1}]}' \
  201

# Test 2: Invalid HMAC
echo -e "${YELLOW}Test 2: Invalid HMAC${NC}"
run_test "Invalid HMAC" \
  "http://localhost:3000/webhooks" \
  "-H 'Content-Type: application/json' -H 'X-Shopify-Topic: carts/create' -H 'X-Shopify-Shop-Domain: test-shop.myshopify.com' -H 'X-Shopify-Hmac-Sha256: invalid_hmac_signature_that_will_be_rejected'" \
  '{"id":"123456789","cart_token":"abc123","shop_id":"test-shop.myshopify.com","items":[{"product_id":"123","quantity":1}]}' \
  401

# Test 3: Missing HMAC header
echo -e "${YELLOW}Test 3: Missing HMAC header${NC}"
run_test "Missing HMAC Header" \
  "http://localhost:3000/webhooks" \
  "-H 'Content-Type: application/json' -H 'X-Shopify-Topic: carts/create' -H 'X-Shopify-Shop-Domain: test-shop.myshopify.com'" \
  '{"id":"123456789","cart_token":"abc123","shop_id":"test-shop.myshopify.com"}' \
  401

# Test 4: Cart update webhook
echo -e "${YELLOW}Test 4: Cart update webhook${NC}"
run_test "Cart Update Webhook" \
  "http://localhost:3000/webhooks" \
  "-H 'Content-Type: application/json' -H 'X-Shopify-Topic: carts/update' -H 'X-Shopify-Shop-Domain: test-shop.myshopify.com' -H 'X-Shopify-Hmac-Sha256: Dn1G5P46dHKj5+9tHAZ1Uxh6Igbq77ytY1pLzeWWZMc='" \
  '{"id":"123456789","cart_token":"abc123","shop_id":"test-shop.myshopify.com","items":[{"product_id":"123","quantity":2}],"updated_at":"2025-09-08T12:00:00Z"}' \
  201

# Cleanup
rm -f response.txt

echo -e "${GREEN}All tests completed!${NC}"

# Ask if the user wants to stop the application if we started it
if [ -f .app.pid ]; then
  echo ""
  read -p "Do you want to stop the NestJS application? (y/n): " STOP_APP
  if [[ $STOP_APP =~ ^[Yy]$ ]]; then
    APP_PID=$(cat .app.pid)
    kill $APP_PID
    rm .app.pid
    echo -e "${GREEN}NestJS application stopped.${NC}"
  else
    echo -e "${YELLOW}NestJS application still running on PID $(cat .app.pid).${NC}"
  fi
fi

# Ask if the user wants to stop the Docker containers
echo ""
read -p "Do you want to stop the Docker containers? (y/n): " STOP_CONTAINERS
if [[ $STOP_CONTAINERS =~ ^[Yy]$ ]]; then
  docker-compose down
  echo -e "${GREEN}Docker containers stopped.${NC}"
else
  echo -e "${YELLOW}Docker containers still running.${NC}"
fi

echo ""
echo -e "${GREEN}Test script completed.${NC}"

