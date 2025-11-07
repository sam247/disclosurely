# Prompt for Cursor AI

Copy and paste this prompt into Cursor to have it set up FFmpeg in your Docker environment:

---

## PROMPT START

I need to install FFmpeg in my local Supabase Docker environment. I have Docker running locally and need to:

1. **Build a custom Docker image** that includes FFmpeg for Supabase edge functions
   - The Dockerfile is located at: `supabase/functions/Dockerfile`
   - It should build an image called `supabase-functions-ffmpeg:latest`

2. **Integrate with my Supabase setup**
   - I'm using Supabase CLI locally (`supabase start`)
   - I need the edge functions container to use the custom FFmpeg-enabled image

3. **Verify the installation**
   - Check that FFmpeg is available in the functions container
   - Test it with: `ffmpeg -version`

4. **Restart Supabase** to use the new image

The project has these files ready:
- `supabase/functions/Dockerfile` - Custom Deno image with FFmpeg
- `docker-compose.override.yml` - Docker Compose override configuration
- `setup-ffmpeg-docker.sh` - Automated setup script
- `DOCKER_SETUP_INSTRUCTIONS.md` - Detailed manual instructions

Please:
1. Build the Docker image using the provided Dockerfile
2. Configure Supabase to use this custom image for edge functions
3. Restart Supabase services
4. Verify FFmpeg is installed and accessible
5. Show me how to test video metadata stripping

## PROMPT END

---

## Alternative Shorter Prompt

If Cursor needs a more concise prompt:

---

Build and configure FFmpeg for Supabase edge functions:

1. Run: `./setup-ffmpeg-docker.sh`
2. Stop Supabase: `supabase stop`
3. Start Supabase: `supabase start`
4. Find functions container: `docker ps | grep functions`
5. Test FFmpeg: `docker exec -it <container-id> ffmpeg -version`

The setup files are already in the repo. Just need to execute them.

---

## What Cursor Should Do

When you give this prompt to Cursor, it should:

1. **Execute the setup script**:
   ```bash
   ./setup-ffmpeg-docker.sh
   ```

2. **Or manually build the image**:
   ```bash
   docker build -t supabase-functions-ffmpeg:latest -f supabase/functions/Dockerfile supabase/functions/
   ```

3. **Restart Supabase**:
   ```bash
   supabase stop
   supabase start
   ```

4. **Verify installation**:
   ```bash
   # Find the container
   docker ps

   # Test FFmpeg in the container
   docker exec -it supabase-edge-functions-<project-id> ffmpeg -version
   ```

5. **Test with a video file**:
   ```bash
   # Get your local Supabase credentials
   cat supabase/.env.local | grep ANON_KEY

   # Test the endpoint
   curl -X POST \
     -H "Authorization: Bearer <ANON_KEY>" \
     -F "file=@test-video.mp4" \
     http://localhost:54321/functions/v1/strip-all-metadata \
     -o cleaned-video.mp4
   ```

## Expected Output

When successful, you should see:
- ✅ Docker image builds successfully
- ✅ FFmpeg version displayed (e.g., "ffmpeg version 6.0")
- ✅ Supabase starts with custom image
- ✅ Video metadata stripping works without errors

## If Issues Occur

If Cursor encounters issues, tell it to:

1. **Check Docker daemon is running**: `docker ps`
2. **Check Supabase CLI version**: `supabase --version`
3. **View container logs**: `docker logs <container-id>`
4. **Read the detailed guide**: `cat DOCKER_SETUP_INSTRUCTIONS.md`

## What to Expect

Total time: ~2-5 minutes
- Building image: 1-2 minutes
- Restarting Supabase: 30-60 seconds
- Testing: 30 seconds

After setup, video files uploaded through your app will have metadata stripped using FFmpeg automatically.
