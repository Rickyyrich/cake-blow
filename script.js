document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  const icing = document.querySelector(".icing");
  const candleCountDisplay = document.getElementById("candleCount");

  const params = new URLSearchParams(window.location.search);
  let initialCandles = parseInt(params.get("candles")) || 27;

  let audioContext;
  let analyser;
  let microphone;

  // ✅ THIS WAS MISSING
  const candles = [];

  function updateCandleCount() {
    const activeCandles = candles.filter(
      (candle) => !candle.classList.contains("out")
    ).length;
    candleCountDisplay.textContent = activeCandles;
  }

  function addCandle(x, y) {
    const candle = document.createElement("div");
    candle.className = "candle";
    candle.style.left = x + "px";
    candle.style.top = y + "px";

    const flame = document.createElement("div");
    flame.className = "flame";
    candle.appendChild(flame);

    cake.appendChild(candle);
    candles.push(candle);
    updateCandleCount();
  }

  // 🎂 Place initial candles ONLY on icing
  function placeInitialCandles(count) {
    const rect = icing.getBoundingClientRect();
    const cakeRect = cake.getBoundingClientRect();

    for (let i = 0; i < count; i++) {
      const x =
        rect.left -
        cakeRect.left +
        Math.random() * rect.width;

      const y =
        rect.top -
        cakeRect.top +
        Math.random() * rect.height;

      addCandle(x, y);
    }
  }

  cake.addEventListener("click", function (event) {
    const icingRect = icing.getBoundingClientRect();

    if (
      event.clientX < icingRect.left ||
      event.clientX > icingRect.right ||
      event.clientY < icingRect.top ||
      event.clientY > icingRect.bottom
    ) {
      return; // ❌ clicks outside icing ignored
    }

    const cakeRect = cake.getBoundingClientRect();
    const x = event.clientX - cakeRect.left;
    const y = event.clientY - cakeRect.top;

    addCandle(x, y);
  });

  function isBlowing() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }

    return sum / bufferLength > 40;
  }

  function blowOutCandles() {
    if (!isBlowing()) return;

    candles.forEach((candle) => {
      if (!candle.classList.contains("out") && Math.random() > 0.5) {
        candle.classList.add("out");
      }
    });

    updateCandleCount();
  }

  if (navigator.mediaDevices?.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        setInterval(blowOutCandles, 200);
      });
  }

  // 🚀 INIT
  placeInitialCandles(initialCandles);
});
