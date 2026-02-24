document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  const candleCountDisplay = document.getElementById("candleCount");
  const birthdayMessage = document.getElementById("birthdayMessage");

  const params = new URLSearchParams(window.location.search);
  const initialCandleCount = parseInt(params.get("candles")) || 27;

  let candles = [];
  let audioContext;
  let analyser;
  let microphone;

  function updateCandleCount() {
    const active = candles.filter(
      (c) => !c.classList.contains("out")
    ).length;

    candleCountDisplay.textContent = active;

    if (active === 0 && birthdayMessage) {
      birthdayMessage.style.display = "block";
    }
  }

  function addCandle(left, top) {
    const candle = document.createElement("div");
    candle.className = "candle";
    candle.style.left = `${left}px`;
    candle.style.top = `${top}px`;

    const flame = document.createElement("div");
    flame.className = "flame";
    candle.appendChild(flame);

    cake.appendChild(candle);
    candles.push(candle);
    updateCandleCount();
  }

  function addInitialCandles(count) {
  const rect = cake.getBoundingClientRect();

  // 🔒 HARD-DEFINED ICING ZONE (px, not %)
  const icingTop = 20;   // px from top of cake
  const icingBottom = 55; // px from top of cake

  for (let i = 0; i < count; i++) {
    const left = Math.random() * (rect.width - 30) + 15;
    const top =
      Math.random() * (icingBottom - icingTop) + icingTop;

    addCandle(left, top);
  }
}

  cake.addEventListener("click", function (event) {
  const rect = cake.getBoundingClientRect();

  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;

  const icingTop = 20;
  const icingBottom = 55;

  // Clamp clicks to top icing zone
  y = Math.min(Math.max(y, icingTop), icingBottom);

  addCandle(x, y);
});

  function isBlowing() {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    const avg =
      dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    return avg > 40;
  }

  function blowOutCandles() {
    if (!isBlowing()) return;

    let changed = false;

    candles.forEach((candle) => {
      if (!candle.classList.contains("out") && Math.random() > 0.5) {
        candle.classList.add("out");
        changed = true;
      }
    });

    if (changed) updateCandleCount();
  }

  // ⏳ IMPORTANT: wait for layout before adding candles
  setTimeout(() => {
    addInitialCandles(initialCandleCount);
  }, 100);

  function startMic() {
  if (audioContext) return;

  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume();

    analyser = audioContext.createAnalyser();
    microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);
    analyser.fftSize = 256;

    setInterval(blowOutCandles, 200);
  });
}

// Chrome requires user interaction
document.addEventListener("click", startMic, { once: true });
document.addEventListener("touchstart", startMic, { once: true }););
  }
});
