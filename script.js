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
  const icing = cake.querySelector(".icing");
  if (!icing) return;

  const cakeRect = cake.getBoundingClientRect();
  const icingRect = icing.getBoundingClientRect();

  for (let i = 0; i < count; i++) {
    const left =
      icingRect.left - cakeRect.left +
      Math.random() * (icingRect.width - 20) + 10;

    const top =
      icingRect.top - cakeRect.top +
      Math.random() * (icingRect.height - 20) + 5;

    addCandle(left, top);
  }
}

  cake.addEventListener("click", function (event) {
  const icing = cake.querySelector(".icing");
  if (!icing) return;

  const cakeRect = cake.getBoundingClientRect();
  const icingRect = icing.getBoundingClientRect();

  let x = event.clientX;
  let y = event.clientY;

  // Clamp click to icing area
  x = Math.min(Math.max(x, icingRect.left), icingRect.right);
  y = Math.min(Math.max(y, icingRect.top), icingRect.bottom);

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
