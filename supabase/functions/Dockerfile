# Custom Deno runtime with FFmpeg for Supabase Edge Functions
FROM denoland/deno:1.40.0

# Install FFmpeg and required dependencies
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Verify FFmpeg installation
RUN ffmpeg -version && echo "✓ FFmpeg installed successfully"

# Set working directory
WORKDIR /home/deno

# Note: The actual function code will be mounted as a volume
# This ensures hot-reloading works during development
