#!/bin/bash

# Deploy Firestore Rules for Two-Step Verification
# This script deploys the updated Firestore security rules

echo "🔒 Deploying Firestore Security Rules with Two-Step Verification support..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
firebase login:list > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Not logged into Firebase. Please run:"
    echo "   firebase login"
    exit 1
fi

# Deploy Firestore rules
echo "📤 Deploying Firestore rules..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo "✅ Firestore rules deployed successfully!"
    echo ""
    echo "The following security rule has been added:"
    echo "  - auth_pins collection: Server-side only access (no client access)"
    echo ""
    echo "Next steps:"
    echo "  1. Set up email service (see docs/TWO_STEP_VERIFICATION.md)"
    echo "  2. Test the two-step verification flow"
    echo "  3. Monitor Firestore logs for any access issues"
else
    echo "❌ Failed to deploy Firestore rules"
    exit 1
fi
