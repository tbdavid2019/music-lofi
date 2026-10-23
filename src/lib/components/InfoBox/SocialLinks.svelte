<script lang="ts">
  import { Github } from "lucide-svelte";
</script>

<div class="social-links">
  <a href="https://github.com/tbdavid2019/music-lofi" target="_blank" rel="noreferrer" aria-label="GitHub Repository">
    <Github size={22} />
  </a>
</div>

<style>
  .social-links {
    display: flex;
    align-items: center;
    padding: 0 10px;
    margin-top: 5px;
  }
  .social-links a {
    margin-right: 20px;
    color: white;
  }
  .social-links a:hover {
    opacity: 80%;
  }
</style>
