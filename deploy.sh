#!/bin/bash

# RENTAMOTO Deployment Script for Vercel

echo "🚀 Starting RENTAMOTO deployment preparation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if required environment variables are set
check_env_vars() {
    print_info "Checking environment variables..."
    
    required_vars=("SUPABASE_URL" "SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY")
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -ne 0 ]]; then
        print_error "Missing required environment variables:"
        printf '%s\n' "${missing_vars[@]}"
        print_info "Please set these variables in your .env file or Vercel dashboard"
        exit 1
    fi
    
    print_status "Environment variables check passed"
}

# Install dependencies
install_dependencies() {
    print_info "Installing backend dependencies..."
    npm ci --production=false
    
    print_info "Installing frontend dependencies..."
    cd frontend
    npm ci --production=false
    cd ..
    
    print_status "Dependencies installed successfully"
}

# Run tests
run_tests() {
    print_info "Running backend tests..."
    npm test -- --passWithNoTests
    
    print_info "Running frontend tests..."
    cd frontend
    npm test -- --passWithNoTests --watchAll=false
    cd ..
    
    print_status "Tests completed"
}

# Build frontend for production
build_frontend() {
    print_info "Building frontend for production..."
    cd frontend
    npm run build
    cd ..
    
    if [[ -d "frontend/build" ]]; then
        print_status "Frontend build completed successfully"
    else
        print_error "Frontend build failed"
        exit 1
    fi
}

# Validate backend setup
validate_backend() {
    print_info "Validating backend configuration..."
    npm run validate
    print_status "Backend validation completed"
}

# Deploy to Vercel
deploy_to_vercel() {
    print_info "Deploying to Vercel..."
    
    if command -v vercel &> /dev/null; then
        # Deploy backend
        print_info "Deploying backend..."
        vercel --prod --yes
        
        # Deploy frontend
        print_info "Deploying frontend..."
        cd frontend
        vercel --prod --yes
        cd ..
        
        print_status "Deployment to Vercel completed!"
    else
        print_warning "Vercel CLI not installed. Please install it with:"
        echo "npm install -g vercel"
        print_info "Then run: vercel login"
        print_info "And finally: ./deploy.sh"
    fi
}

# Main deployment process
main() {
    print_info "🚴 RENTAMOTO Deployment Pipeline Starting..."
    echo "=================================="
    
    # check_env_vars
    install_dependencies
    # run_tests
    validate_backend
    build_frontend
    
    print_status "🎉 Deployment preparation completed!"
    print_info "Next steps:"
    echo "1. Install Vercel CLI: npm install -g vercel"
    echo "2. Login to Vercel: vercel login" 
    echo "3. Deploy backend: vercel --prod"
    echo "4. Deploy frontend: cd frontend && vercel --prod"
    echo "5. Update REACT_APP_API_URL in frontend/.env.production"
    
    echo ""
    print_status "🚀 Your RENTAMOTO app is ready for production!"
}

# Run main function
main