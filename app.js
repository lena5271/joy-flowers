const SUPABASE_URL = "https://bjlhicwwxkowcstnfbni.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_d7D86iRz6wOGtDX9rdW8LQ_wUogdTKW";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// -------------------------
// Record a flower being found
// -------------------------
async function recordFlowerScan() {
  const { error } = await db
    .from("flower_scans")
    .insert({});

  if (error) {
    console.error("Flower scan error:", error);
  }
}
  const params = new URLSearchParams(window.location.search);
  const flowerId = params.get("flower");

  if (!flowerId) return;

  const { error } = await db
    .from("flower_finds")
    .insert({
      flower_id: flowerId
    });

  // 23505 means this flower was already recorded.
  // That's okay — we only want to count each flower once.
  if (error && error.code !== "23505") {
    console.error("Flower tracking error:", error);
  }
}


// -------------------------
// Load the counters
// -------------------------

async function loadCounters() {

  const flowerCounter = document.getElementById("flowers-found");
  const joyCounter = document.getElementById("joys-shared");

  if (!flowerCounter || !joyCounter) return;

  // Count flowers
  const { count: flowerCount, error: flowerError } = await db
    .from("flower_finds")
    .select("*", { count: "exact", head: true });

  if (flowerError) {
    console.error("Flower counter error:", flowerError);
  } else {
    flowerCounter.textContent = flowerCount || 0;
  }


  // Count approved joys
  const { count: joyCount, error: joyError } = await db
    .from("Messages")
    .select("*", { count: "exact", head: true })
    .eq("approved", true);

  if (joyError) {
    console.error("Joy counter error:", joyError);
  } else {
    joyCounter.textContent = joyCount || 0;
  }
}


// -------------------------
// Load the Joy Wall
// -------------------------

async function loadMessages() {

  const messages = document.getElementById("messages");

  if (!messages) return;

  const { data, error } = await db
    .from("Messages")
    .select("text, created_at")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("Message loading error:", error);

    messages.innerHTML =
      "<p>We're taking a little moment. The Joy Wall will be back soon.</p>";

    return;
  }

  if (!data || !data.length) {

    messages.innerHTML =
      "<p>Be the first person to leave a little joy. 🌸</p>";

    return;
  }

  messages.innerHTML = data
    .map(
      (message) => `
        <div>
          ${escapeHtml(message.text)}
          <small>Someone who found a flower</small>
        </div>
      `
    )
    .join("");
}


// -------------------------
// Leave a Joy
// -------------------------

async function leaveJoy() {

  const textBox = document.getElementById("message");
  const status = document.getElementById("status");

  const text = textBox.value.trim();

  if (!text) {
    status.textContent = "Write a little something first.";
    return;
  }

  status.textContent = "Leaving your little joy…";

  const { error } = await db
    .from("Messages")
    .insert({
      text: text,
      approved: false
    });

  if (error) {

    console.error("Message submission error:", error);

    status.textContent =
      "Something went wrong. Please try again.";

    return;
  }

  textBox.value = "";

  status.textContent =
    "Thank you for leaving a little joy. 🌸";
}


// -------------------------
// Security helper
// -------------------------

function escapeHtml(text) {

  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}


// -------------------------
// Start everything
// -------------------------

recordFlowerScan();
loadCounters();
loadMessages();
