#!/bin/bash

echo "🚀 Preparing backend for Hugging Face Spaces deployment..."

# Create HF deployment directory
HF_DIR="huggingface-deploy"
rm -rf $HF_DIR
mkdir -p $HF_DIR

echo "📁 Copying backend files..."

# Copy necessary files
cp backend/Dockerfile $HF_DIR/
cp backend/requirements.txt $HF_DIR/
cp -r backend/src $HF_DIR/
cp backend/README_HF.md $HF_DIR/README.md

echo "✅ Files prepared!"
echo ""
echo "📦 Deployment Package Created: $HF_DIR"
echo ""
echo "📋 Next Steps:"
echo "1. Go to: https://huggingface.co/spaces"
echo "2. Click 'Create new Space'"
echo "3. Name: todo-api-backend (or your choice)"
echo "4. SDK: Docker"
echo "5. Hardware: CPU Basic (Free)"
echo "6. Upload all files from '$HF_DIR' folder"
echo "7. Add environment variables (see HUGGINGFACE_DEPLOYMENT.md)"
echo ""
echo "🎉 Your API will be live at:"
echo "   https://your-username-todo-api-backend.hf.space"
echo ""

# For macOS/Linux
if command -v open &> /dev/null; then
    read -p "Open deployment folder now? (Y/N) " response
    if [ "$response" = "Y" ] || [ "$response" = "y" ]; then
        open $HF_DIR
    fi
fi

echo "✨ Ready to deploy!"
