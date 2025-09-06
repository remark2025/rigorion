#!/bin/bash

# Manual Deployment Script for SAT-Specialized Branch
# Run this script to prepare your deployment package

echo "🚀 SAT Platform - Manual Deployment Preparation"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Build the project
echo "📦 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix the errors and try again."
    exit 1
fi

echo "✅ Build completed successfully!"

# Create deployment package
echo "📁 Creating deployment package..."
cd dist

# Create timestamp for unique deployment
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DEPLOYMENT_NAME="sat-specialized-${TIMESTAMP}.zip"

# Create zip file
zip -r "../${DEPLOYMENT_NAME}" .
cd ..

echo "✅ Deployment package created: ${DEPLOYMENT_NAME}"

# Show deployment options
echo ""
echo "🎯 Your deployment is ready! Choose an option:"
echo ""
echo "Option 1 - Netlify Drag & Drop:"
echo "  1. Go to https://app.netlify.com"
echo "  2. Click 'Add new site' → 'Deploy manually'"
echo "  3. Drag and drop the 'dist' folder"
echo ""
echo "Option 2 - ZIP Upload:"
echo "  1. Use the file: ${DEPLOYMENT_NAME}"
echo "  2. Upload to any static hosting service"
echo ""
echo "Option 3 - FTP/Server Upload:"
echo "  1. Extract ${DEPLOYMENT_NAME}"
echo "  2. Upload contents to your web server"
echo ""

# Show what's included
echo "📋 What's included in this deployment:"
echo "  ✅ Complete theme transformation (charcoal/silver/orange)"
echo "  ✅ Practice page with mywall.jpg backgrounds"
echo "  ✅ Enhanced analytics with horizontal bar graphs"
echo "  ✅ All interactive features and animations"
echo "  ✅ Responsive design for all devices"
echo ""

# Show file sizes
echo "📊 Build statistics:"
ls -lh dist/ | grep -E "\.(html|css|js)$" | awk '{print "  " $9 ": " $5}'

echo ""
echo "🎉 Ready for deployment! Your SAT platform is optimized and ready to go live."

# Open dist folder if on desktop environment
if command -v xdg-open > /dev/null; then
    echo "📂 Opening dist folder..."
    xdg-open dist/
elif command -v open > /dev/null; then
    echo "📂 Opening dist folder..."
    open dist/
fi