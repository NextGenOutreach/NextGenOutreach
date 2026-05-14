# 🚀 NextGenOutreach Production Deployment Guide

## 📋 Prerequisites

- Docker and Docker Compose installed
- Server with at least 4GB RAM and 2 CPU cores
- Domain name configured (nextgenoutreach.co.za)
- SSL certificates (or use Let's Encrypt)
- PostgreSQL and Redis passwords
- All environment variables configured

## 🔧 Environment Setup

### 1. Configure Environment Variables

Copy and edit the production environment file:

```bash
cp .env.example .env.production
```

Update the following critical variables:
- `JWT_SECRET` and `JWT_REFRESH_SECRET` (generate with `openssl rand -base64 32`)
- `DATABASE_URL` with your PostgreSQL credentials
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- `SENDGRID_API_KEY` for email functionality
- `AWS_*` variables for file storage
- `PAYFAST_*` variables for payment processing

### 2. Generate Secure Secrets

```bash
# Generate JWT secrets
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

echo "JWT_SECRET=$JWT_SECRET"
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
echo "SESSION_SECRET=$SESSION_SECRET"
```

## 🔒 SSL Certificate Setup

### Option 1: Let's Encrypt (Recommended)

```bash
# Make the script executable
chmod +x scripts/setup-ssl.sh

# Run the SSL setup (test with staging first)
./scripts/setup-ssl.sh --staging
./scripts/setup-ssl.sh
```

### Option 2: Self-Signed (Development Only)

```bash
# Generate self-signed certificates
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=ZA/ST=Western Cape/L=Cape Town/O=NextGenOutreach/CN=nextgenoutreach.co.za"
```

## 🚀 Deployment Steps

### 1. Automated Deployment

```bash
# Make the deployment script executable
chmod +x scripts/deploy.sh

# Run the deployment
./scripts/deploy.sh
```

### 2. Manual Deployment

```bash
# Create necessary directories
mkdir -p logs backups ssl monitoring/grafana/{dashboards,datasources}

# Build and start services
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
sleep 30

# Run database migrations
docker-compose -f docker-compose.prod.yml exec api npx prisma migrate deploy

# Check service health
curl http://localhost:3001/health
```

## 📊 Monitoring Setup

### Health Checks

- **API Health**: `http://localhost:3001/health`
- **Database Health**: Included in API health check
- **Redis Health**: Included in API health check

### Prometheus & Grafana

```bash
# Access monitoring dashboards
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001 (admin/password from env)
```

### Log Monitoring

```bash
# View API logs
docker-compose -f docker-compose.prod.yml logs -f api

# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View nginx logs
docker-compose -f docker-compose.prod.yml logs -f nginx
```

## 🔧 Database Management

### Backups

Automated backups are created daily and stored in `./backups/`. To manually backup:

```bash
# Create manual backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres nextgen_outreach > backup-$(date +%Y%m%d).sql

# Restore from backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres nextgen_outreach < backup-file.sql
```

### Migrations

```bash
# Run migrations
docker-compose -f docker-compose.prod.yml exec api npx prisma migrate deploy

# Generate new migration
docker-compose -f docker-compose.prod.yml exec api npx prisma migrate dev --name migration_name
```

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check database status
   docker-compose -f docker-compose.prod.yml ps postgres
   
   # Check database logs
   docker-compose -f docker-compose.prod.yml logs postgres
   ```

2. **API Not Responding**
   ```bash
   # Check API logs
   docker-compose -f docker-compose.prod.yml logs api
   
   # Restart API service
   docker-compose -f docker-compose.prod.yml restart api
   ```

3. **SSL Certificate Issues**
   ```bash
   # Check certificate files
   ls -la ssl/
   
   # Verify certificate
   openssl x509 -in ssl/cert.pem -text -noout
   ```

### Performance Monitoring

```bash
# Check resource usage
docker stats

# Check disk space
df -h

# Check memory usage
free -h
```

## 🔐 Security Checklist

- [ ] Environment variables are properly set
- [ ] SSL certificates are installed and valid
- [ ] Database passwords are strong
- [ ] JWT secrets are generated and secure
- [ ] Firewall is configured (ports 80, 443 only)
- [ ] Regular backups are scheduled
- [ ] Monitoring is configured
- [ ] Log rotation is set up
- [ ] Rate limiting is active
- [ ] Security headers are configured

## 📈 Scaling Considerations

### Horizontal Scaling

- Load balancer configuration
- Database connection pooling
- Redis clustering
- Container orchestration (Kubernetes)

### Performance Optimization

- CDN setup for static assets
- Database query optimization
- Caching strategies
- Image optimization

## 🔄 Maintenance Tasks

### Daily

- Check health endpoints
- Review error logs
- Monitor resource usage

### Weekly

- Update dependencies
- Review backup logs
- Security scan

### Monthly

- Update SSL certificates
- Database maintenance
- Performance review

## 📞 Support

For deployment issues:

1. Check the logs: `docker-compose logs`
2. Verify environment variables
3. Check health endpoints
4. Review this documentation
5. Contact the development team

---

**Remember**: Always test deployment in a staging environment first!
