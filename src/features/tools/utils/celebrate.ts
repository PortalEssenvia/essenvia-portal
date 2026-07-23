import confetti from "canvas-confetti";

// HSL brand colors resolved to hex-ish rgba for confetti
const BRAND_COLORS = ["#C9A961", "#E4C989", "#1F3A2E", "#3A6B4F", "#F5EFE0"];

export const celebratePractice = () => {
  confetti({
    particleCount: 45,
    spread: 55,
    startVelocity: 35,
    origin: { y: 0.75 },
    colors: BRAND_COLORS,
    scalar: 0.9,
    disableForReducedMotion: true,
  });
};

export const celebrateMilestone = () => {
  const end = Date.now() + 900;
  const fire = (angle: number, origin: { x: number; y: number }) => {
    confetti({
      particleCount: 90,
      spread: 80,
      startVelocity: 55,
      angle,
      origin,
      colors: BRAND_COLORS,
      disableForReducedMotion: true,
    });
  };
  fire(60, { x: 0.1, y: 0.7 });
  fire(120, { x: 0.9, y: 0.7 });

  const interval = window.setInterval(() => {
    if (Date.now() > end) return window.clearInterval(interval);
    confetti({
      particleCount: 30,
      spread: 100,
      startVelocity: 40,
      origin: { x: Math.random(), y: Math.random() * 0.3 + 0.4 },
      colors: BRAND_COLORS,
      disableForReducedMotion: true,
    });
  }, 250);
};