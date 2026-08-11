export function splitLines(text) {
  if (!text) return [];
  return text.split("\n").map((s) => s.trim()).filter(Boolean);
}

export function parseFees(rawFees) {
  return rawFees.map((f) => {
    const parts = f.split(/[:\-]/);
    if (parts.length > 1) {
      return { label: parts[0].trim(), value: parts.slice(1).join("-").trim() };
    }
    return { label: f, value: "" };
  });
}

export function parseTerms(rawTerms) {
  let rawText = rawTerms.join(" ");
  rawText = rawText.replace(/(Tracking Time)/gi, "|||$1");
  rawText = rawText.replace(/(Payout Time)/gi, "|||$1");
  rawText = rawText.replace(/(Cookie Window)/gi, "|||$1");
  rawText = rawText.replace(/(Commission)/gi, "|||$1");

  const splitTerms = rawText.split("|||").map((t) => t.trim()).filter((t) => t !== "");

  return splitTerms.map((t) => {
    const splitIndex = t.indexOf(":");
    let label = "Term";
    let value = t;
    let icon = "file-text";

    if (splitIndex !== -1) {
      label = t.substring(0, splitIndex).trim();
      value = t.substring(splitIndex + 1).trim().replace(/[,;.]+$/, "").trim();
      if (value === "") value = "Not Specified";

      const lowerLabel = label.toLowerCase();
      if (lowerLabel.includes("tracking")) icon = "zap";
      else if (lowerLabel.includes("payout") || lowerLabel.includes("time")) icon = "clock";
      else if (lowerLabel.includes("cookie") || lowerLabel.includes("window")) icon = "shield";
      else if (lowerLabel.includes("commission")) icon = "file-text";
    }

    return { label, value, icon };
  });
}

export function initialsOf(name) {
  const words = (name || "").trim().split(" ");
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return (name || "").trim().slice(0, 2).toUpperCase();
}

