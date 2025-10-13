<script lang="ts">
  import { IconArrowLeft, IconArrowRight, IconRefresh } from "@tabler/icons-svelte";

  // Get id from localstorage, or use random background on first load
  let id: any = localStorage.getItem("bg-id");
  if (!id) {
    // First time load - pick random background
    id = Math.floor(Math.random() * 10) + 1;
    localStorage.setItem("bg-id", id.toString());
  }
  
  const bg = document.getElementById("bg");
  bg.style.backgroundImage = `url('assets/background/bg${id}.jpg')`;

  function randomBg() {
    // Generate random number between 1-10, but different from current
    let newId;
    do {
      newId = Math.floor(Math.random() * 10) + 1;
    } while (newId === parseInt(id));
    
    id = newId;
    bg.style.backgroundImage = `url('assets/background/bg${id}.jpg')`;
    localStorage.setItem("bg-id", id.toString());
  }

  function nextBg() {
    if (id < 10) {
      // @ts-ignore
      id = new Number(id) + 1;
    } else {
      id = 1;
    }
    bg.style.backgroundImage = `url('assets/background/bg${id}.jpg')`;
    localStorage.setItem("bg-id", id.toString());
  }

  function prevBg() {
    const bg = document.getElementById("bg");
    if (id > 1) {
      id = id - 1;
    } else {
      id = 10;
    }
    bg.style.backgroundImage = `url('assets/background/bg${id}.jpg')`;
    localStorage.setItem("bg-id", id.toString());
  }

  // Shortcuts to change background using arrow keys
  window.addEventListener("keydown", (e: KeyboardEvent) => {
    // Prevent bg change when targeting inputs
    if (e.target instanceof HTMLElement && !e.target.closest("input")) {
      if (e.key === "ArrowRight") {
        nextBg();
      } else if (e.key === "ArrowLeft") {
        prevBg();
      }
    }
  });
</script>

<div>
  <h4>Background</h4>
  <div class="container">
    <button on:click={prevBg} title="上一張背景">
      <IconArrowLeft size={20} />
    </button>
    <img id="bg-preview" src="assets/background/bg{id}.jpg" alt="" />
    <button on:click={nextBg} title="下一張背景">
      <IconArrowRight size={20} />
    </button>
  </div>
  <div class="random-btn-container">
    <button class="random-btn" on:click={randomBg} title="隨機背景">
      <IconRefresh size={18} />
      <span>隨機背景</span>
    </button>
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20px;
    justify-content: center;
  }
  #bg-preview {
    width: 200px;
    height: 120px;
    border-radius: 7px;
    margin: 0 10px;
  }
  button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    color: white;
    overflow: hidden;
  }
  button:hover {
    backdrop-filter: blur(10px);
    background-color: rgba(0, 0, 0, 10%);
  }

  .random-btn-container {
    display: flex;
    justify-content: center;
    margin-top: 10px;
  }

  .random-btn {
    width: auto;
    height: auto;
    padding: 8px 16px;
    border-radius: 8px;
    background: rgba(102, 126, 234, 0.2);
    border: 1px solid rgba(102, 126, 234, 0.4);
    color: white;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    transition: all 0.2s;
  }

  .random-btn:hover {
    background: rgba(102, 126, 234, 0.3);
    border-color: rgba(102, 126, 234, 0.6);
    transform: translateY(-1px);
  }

  .random-btn:active {
    transform: translateY(0);
  }

  @media only screen and (max-width: 600px) {
    #bg-preview {
      width: 90px;
      height: 150px;
      aspect-ratio: 16 / 9;
      object-fit: cover;
      background-size: cover;
      background-position: center;
    }
  }
</style>
