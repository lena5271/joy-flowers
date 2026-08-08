const SUPABASE_URL = "https://bjlhicwwxkowcstnfbni.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "sb_publishable_d7D86iRz6wOGtDX9rdW8LQ_wUogdTKW";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
    console.error(error);
    messages.innerHTML =
      "<p>We're taking a little moment. The Joy Wall will be back soon.</p>";
    return;
  }

  if (!data.length) {
    messages.innerHTML =
      "<p>Be the first person to leave a little joy. 🌸</p>";
    return;
  }

  messages.innerHTML = data
    .map(
      (message) => `
        <div class="message">
          ${escapeHtml(message.text)}
          <small>Someone who found a flower</small>
        </div>
      `
    )
    .join("");
}

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
  console.error("SUPABASE ERROR:", error);
  status.textContent = "Error: " + error.message;
  return;
}

  textBox.value = "";
  status.textContent =
    "Thank you for leaving a little joy. 🌸";
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

loadMessages();
