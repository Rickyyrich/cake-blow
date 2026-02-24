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

    // 🎊 Confetti
    launchConfetti();

    // 🎵 Birthday tune
    const audio = document.getElementById("birthdayAudio");
    if (audio) audio.play();
  } else {
    console.warn("birthdayMessage not found (safe to ignore)");
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
function launchConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const confettiCount = 150;
  const confetti = [];

  for (let i = 0; i < confettiCount; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * confettiCount,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      tilt: Math.random() * 10 - 10,
      tiltAngleIncremental: Math.random() * 0.07 + 0.05,
      tiltAngle: 0
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confetti.forEach((c) => {
      ctx.beginPath();
      ctx.lineWidth = c.r / 2;
      ctx.strokeStyle = c.color;
      ctx.moveTo(c.x + c.tilt + c.r / 4, c.y);
      ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r / 4);
      ctx.stroke();
    });
    update();
  }

  function update() {
    confetti.forEach((c, i) => {
      c.tiltAngle += c.tiltAngleIncremental;
      c.y += (Math.cos(c.d) + 3 + c.r / 2) / 2;
      c.tilt = Math.sin(c.tiltAngle) * 15;

      if (c.y > canvas.height) {
        confetti[i] = {
          x: Math.random() * canvas.width,
          y: -10,
          r: c.r,
          d: c.d,
          color: c.color,
          tilt: c.tilt,
          tiltAngleIncremental: c.tiltAngleIncremental,
          tiltAngle: c.tiltAngle
        };
      }
    });
  }

  const confettiInterval = setInterval(draw, 20);

  // Stop confetti after 7 seconds
  setTimeout(() => clearInterval(confettiInterval), 7000);
}
  function placeInitialCandles(count) {
  requestAnimationFrame(() => {
    const icingRect = icing.getBoundingClientRect();
    const cakeRect = cake.getBoundingClientRect();

    for (let i = 0; i < count; i++) {
      // X anywhere across icing
      const x = Math.random() * icingRect.width;

      // Y small random, top part of icing only
      const y = Math.random() * (icingRect.height * 0.5);

      addCandle(x, y);
    }
  });
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
