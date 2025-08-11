#!/bin/bash

# Credit Score AI Deployment Script
# This script sets up and deploys the Credit Score Classification application

set -e

echo "🚀 Starting Credit Score AI Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

print_status "Python 3 found"

# Check if pip is installed
if ! command -v pip &> /dev/null; then
    print_error "pip is not installed. Please install pip first."
    exit 1
fi

print_status "pip found"

# Check if virtual environment exists
if [ ! -d "credit_score_env" ]; then
    print_warning "Virtual environment not found. Creating one..."
    python3 -m venv credit_score_env
    print_status "Virtual environment created"
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source credit_score_env/bin/activate

# Upgrade pip
print_status "Upgrading pip..."
pip install --upgrade pip

# Install requirements
print_status "Installing requirements..."
pip install -r requirements.txt

# Generate sample data if no data exists
if [ ! -f "data/raw/credit_score_data.csv" ]; then
    print_warning "No data found. Generating sample data..."
    python generate_data.py
    print_status "Sample data generated"
fi

# Run tests if available
if [ -d "tests" ]; then
    print_status "Running tests..."
    python -m pytest tests/ -v || print_warning "Some tests failed, but continuing deployment"
fi

# Check if models directory exists
if [ ! -d "models" ]; then
    print_warning "Models directory not found. Creating..."
    mkdir -p models
fi

print_status "Deployment preparation completed!"

# Ask user for deployment type
echo -e "\n${YELLOW}Choose deployment type:${NC}"
echo "1. Local development server"
echo "2. Production with Gunicorn"
echo "3. Docker deployment"
echo "4. Generate static files only"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        print_status "Starting local development server..."
        echo -e "\n${GREEN}🌐 Application will be available at: http://localhost:5000${NC}"
        echo -e "${GREEN}📚 API documentation at: http://localhost:5000/api/model-info${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}\n"
        python app.py
        ;;
    2)
        print_status "Installing Gunicorn..."
        pip install gunicorn
        
        print_status "Starting production server with Gunicorn..."
        echo -e "\n${GREEN}🌐 Application will be available at: http://localhost:5000${NC}"
        echo -e "${GREEN}📚 API documentation at: http://localhost:5000/api/model-info${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}\n"
        gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 120 app:app
        ;;
    3)
        if ! command -v docker &> /dev/null; then
            print_error "Docker is not installed. Please install Docker first."
            exit 1
        fi
        
        print_status "Building Docker image..."
        docker build -t credit-score-ai .
        
        print_status "Running Docker container..."
        echo -e "\n${GREEN}🌐 Application will be available at: http://localhost:5000${NC}"
        echo -e "${GREEN}📚 API documentation at: http://localhost:5000/api/model-info${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop the container${NC}\n"
        docker run -p 5000:5000 --rm credit-score-ai
        ;;
    4)
        print_status "Generating static files and documentation..."
        # Create deployment package
        mkdir -p deployment_package
        cp -r app deployment_package/
        cp -r models deployment_package/ 2>/dev/null || print_warning "No models directory found"
        cp -r data deployment_package/ 2>/dev/null || print_warning "No data directory found"
        cp requirements.txt deployment_package/
        cp config.py deployment_package/
        cp app.py deployment_package/
        cp Dockerfile deployment_package/
        cp docker-compose.yml deployment_package/
        cp README.md deployment_package/
        
        print_status "Deployment package created in 'deployment_package' directory"
        ;;
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

print_status "Deployment script completed!"

echo -e "\n${GREEN}📋 Next Steps:${NC}"
echo -e "  • Visit the application in your browser"
echo -e "  • Test the API endpoints"
echo -e "  • Check the documentation at /about"
echo -e "  • Configure environment variables for production"
echo -e "  • Set up monitoring and logging"
echo -e "  • Configure SSL certificates for HTTPS"

echo -e "\n${GREEN}🔗 Useful Commands:${NC}"
echo -e "  • View logs: docker logs <container_id>"
echo -e "  • Stop application: Ctrl+C or docker stop <container_id>"
echo -e "  • Update dependencies: pip install -r requirements.txt"
echo -e "  • Run tests: python -m pytest tests/"

echo -e "\n${GREEN}📞 Support:${NC}"
echo -e "  • GitHub Issues: https://github.com/SameerRamzan/Credit-Score-Classification-Project/issues"
echo -e "  • Documentation: README.md"
echo -e "  • API Documentation: http://localhost:5000/api/model-info"

echo -e "\n${GREEN}🎉 Thank you for using Credit Score AI!${NC}"