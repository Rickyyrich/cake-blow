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
  const topLayer = cake.querySelector(".layer-top");
  if (!topLayer) return;

  const cakeRect = cake.getBoundingClientRect();
  const layerRect = topLayer.getBoundingClientRect();

  // Define icing zone ABOVE the top layer
  const icingHeight = layerRect.height * 0.5;

  for (let i = 0; i < count; i++) {
    const left =
      layerRect.left - cakeRect.left +
      Math.random() * (layerRect.width - 30) + 15;

    const top =
      layerRect.top - cakeRect.top -
      Math.random() * icingHeight + 5;

    addCandle(left, top);
  }
}

  cake.addEventListener("click", function (event) {
  const topLayer = cake.querySelector(".layer-top");
  if (!topLayer) return;

  const cakeRect = cake.getBoundingClientRect();
  const layerRect = topLayer.getBoundingClientRect();

  let x = event.clientX;
  let y = event.clientY;

  const icingTop = layerRect.top - layerRect.height * 0.5;
  const icingBottom = layerRect.top;

  // Clamp click to icing zone
  x = Math.min(Math.max(x, layerRect.left), layerRect.right);
  y = Math.min(Math.max(y, icingTop), icingBottom);

  addCandle(
    x - cakeRect.left,
    y - cakeRect.top
  );
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
