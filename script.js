document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  const icing = document.querySelector(".icing");
  const candleCountDisplay = document.getElementById("candleCount");
  const birthdayMessage = document.getElementById("birthdayMessage");

  const params = new URLSearchParams(window.location.search);
  let initialCandles = parseInt(params.get("candles")) || 27;
  let birthdayShown = false;
  let audioContext;
  let analyser;
  let microphone;

  const candles = [];

  function getActiveCandleCount() {
    return candles.filter(
      (candle) => !candle.classList.contains("out")
    ).length;
  }

  function updateCandleCount() {
  const activeCandles = candles.filter(
    (candle) => !candle.classList.contains("out")
  ).length;

  candleCountDisplay.textContent = activeCandles;

  // 🎉 SHOW MESSAGE WHEN ALL CANDLES ARE OUT
  if (activeCandles === 0 && !birthdayShown) {
    birthdayShown = true;

    const message = document.getElementById("birthdayMessage");

    if (message) {
      message.style.display = "flex";
      message.style.opacity = "1";
      message.style.visibility = "visible";
      message.style.zIndex = "9999";
      message.style.transform = "translate(-50%, -50%) scale(1)";
    } else {
      console.warn("birthdayMessage not found (safe to ignore)");
    }
  }
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

  function placeInitialCandles(count) {
  const icingWidth = icing.offsetWidth;
  const icingHeight = icing.offsetHeight;

  for (let i = 0; i < count; i++) {
    // Random X inside icing
    const x = Math.random() * icingWidth;
    // Fixed Y so candles are only on top of icing
    const y = 0; // you can adjust like 0–10px if you want slight vertical variation

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
      return;
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

  placeInitialCandles(initialCandles);
});
