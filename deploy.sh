#!/bin/bash
cd "/Users/sampettiford/Documents/Cursor/React Apps/disclosurely"
echo "Current HEAD:"
git rev-parse HEAD
echo "---"
echo "Staging changes..."
git add -A
echo "---"
echo "Committing..."
git commit -m "Trigger Vercel deployment: Restored to working state (pre-onboarding tour)" || echo "Nothing to commit"
echo "---"
echo "Pushing to origin main..."
git push origin main
echo "---"
echo "Push complete. Checking remote..."
git fetch origin
git log origin/main --oneline -1

