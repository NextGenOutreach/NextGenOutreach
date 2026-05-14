#!/bin/bash

# SSL Certificate Setup Script
# This script sets up SSL certificates using Let's Encrypt

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DOMAIN="nextgenoutreach.co.za"
EMAIL="admin@nextgenoutreach.co.za"
SSL_DIR="./ssl"

# Check if certbot is installed
if ! command -v certbot > /dev/null 2>&1; then
    print_status "Installing certbot..."
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
fi

# Create SSL directory
mkdir -p $SSL_DIR

# Get SSL certificate
print_status "Obtaining SSL certificate for $DOMAIN..."

if [ "$1" = "--staging" ]; then
    print_warning "Using Let's Encrypt staging environment for testing..."
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --no-eff-email --staging
else
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --no-eff-email
fi

# Copy certificates to SSL directory
print_status "Copying certificates to SSL directory..."
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $SSL_DIR/cert.pem
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $SSL_DIR/key.pem
sudo chown $USER:$USER $SSL_DIR/*.pem

# Set up auto-renewal
print_status "Setting up auto-renewal..."
sudo crontab -l | grep -q "certbot renew" || (sudo crontab -l; echo "0 12 * * * /usr/bin/certbot renew --quiet") | sudo crontab -

print_status "✅ SSL certificates setup completed!"
print_warning "Certificates will auto-renew. Certificates location: $SSL_DIR/"
