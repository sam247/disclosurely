---
layout: doc
---

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vitepress'

const router = useRouter()

onMounted(() => {
  // Redirect to getting-started on home page load
  if (typeof window !== 'undefined') {
    window.location.href = '/getting-started'
  }
})
</script>

# Redirecting to documentation...

If you are not redirected automatically, [click here to go to Getting Started](/getting-started).
