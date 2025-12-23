const APP_ID = "b183011bd9704da19aae5115ad40e2c6";
const TOKEN_SERVER = "https://your-token-server.onrender.com/token";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

let localTrack;
let remoteCount = 0;

client.on("user-published", async (user, mediaType) => {
  if (mediaType === "audio") {
    await client.subscribe(user, mediaType);
    user.audioTrack.play();
  }
});

client.on("user-joined", () => {
  remoteCount++;
  document.getElementById("users").innerText = `Remote users: ${remoteCount}`;
});

client.on("user-left", () => {
  remoteCount--;
  document.getElementById("users").innerText = `Remote users: ${remoteCount}`;
});

async function getToken(channel) {
  const res = await fetch(`${TOKEN_SERVER}?channel=${channel}`);
  return (await res.json()).token;
}

document.getElementById("join").onclick = async () => {
  const channel =
    new URLSearchParams(window.location.search).get("channel") || "test-call";

  document.getElementById("status").innerText = "Status: Connecting";

  const token = await getToken(channel);

  await client.join(APP_ID, channel, token, null);

  localTrack = await AgoraRTC.createMicrophoneAudioTrack();
  await client.publish([localTrack]);

  document.getElementById("status").innerText = "Status: Connected";

  document.getElementById("join").disabled = true;
  document.getElementById("leave").disabled = false;
};

document.getElementById("leave").onclick = async () => {
  localTrack.stop();
  localTrack.close();
  await client.leave();

  document.getElementById("status").innerText = "Status: Disconnected";
  document.getElementById("join").disabled = false;
  document.getElementById("leave").disabled = true;
};
