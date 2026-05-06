export default function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ ok: false, error: "method_not_allowed" });
    return;
  }

  const expected_phrase = process.env.THE_ROOM_PASSPHRASE;
  if (!expected_phrase) {
    response.status(500).json({ ok: false, error: "THE_ROOM_PASSPHRASE is required" });
    return;
  }
  const passphrase = String(request.body?.passphrase || "").trim();
  const target = normalize_target(request.body?.target);

  if (passphrase !== expected_phrase) {
    response.status(401).json({ ok: false, error: "invalid_passphrase" });
    return;
  }

  response.setHeader(
    "Set-Cookie",
    [
      `auth-the-room=${expected_phrase}`,
      "Path=/",
      "Secure",
      "SameSite=Lax",
      "Max-Age=86400",
    ].join("; ")
  );

  response.status(200).json({ ok: true, target });
}

function normalize_target(value) {
  const target = String(value || "/the-room");

  if (!target.startsWith("/") || target.startsWith("//")) {
    return "/the-room";
  }

  return target;
}
