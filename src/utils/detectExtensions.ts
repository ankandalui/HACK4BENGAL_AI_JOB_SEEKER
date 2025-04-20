// utils/detectExtensions.ts
export async function detectExtensions(): Promise<string[]> {
  const detected: string[] = [];

  // Check for Grammarly
  if (
    (window as any).grammarly !== undefined ||
    document.querySelector("[data-grammarly]")
  ) {
    detected.push("Grammarly");
  }

  // Check for AdBlock
  const ad = document.createElement("div");
  ad.className = "adsbox";
  ad.style.display = "none";
  document.body.appendChild(ad);

  await new Promise((resolve) => setTimeout(resolve, 100));

  if (ad.offsetHeight === 0) {
    detected.push("AdBlock");
  }
  ad.remove();

  // 🔍 Custom check for ActiveTab or similar
  const suspiciousElements = [
    "#activetab-popup", // Hypothetical
    ".activetab-extension-root",
    "[data-extension='activetab']",
  ];

  for (const selector of suspiciousElements) {
    if (document.querySelector(selector)) {
      detected.push("ActiveTab or similar");
      break;
    }
  }

  return detected;
}
