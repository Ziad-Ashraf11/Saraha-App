import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const baseUrl = process.env.API_URL || "http://localhost:3000";
const email = `auth-smoke-${randomUUID()}@example.invalid`;

const request = async (path, { method = "GET", body, token } = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body && { "content-type": "application/json" }),
      ...(token && { authorization: `Bearer ${token}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
  });
  const data = await response.json();
  return { status: response.status, data };
};

const registration = await request("/api/v1/auth/register", {
  method: "POST",
  body: {
    firstName: "Auth",
    lastName: "SmokeTest",
    email,
    password: "SmokeTest123",
  },
});
assert.equal(registration.status, 201, JSON.stringify(registration.data));
assert.equal(registration.data.data.user.emailVerificationCodeHash, undefined);
const verificationCode = registration.data.data.developmentVerificationCode;
assert.ok(verificationCode, "Development response should include a verification code when SMTP is not configured");
console.log("PASS registration; verification internals are not exposed");

const verification = await request("/api/v1/auth/verify-email", {
  method: "POST",
  body: { email, code: verificationCode },
});
assert.equal(verification.status, 200, JSON.stringify(verification.data));
console.log("PASS email verification");

const login = await request("/api/v1/auth/login", {
  method: "POST",
  body: { email, password: "SmokeTest123" },
});
assert.equal(login.status, 200, JSON.stringify(login.data));
const { accessToken, refreshToken } = login.data.data;
assert.ok(accessToken);
assert.ok(refreshToken);
console.log("PASS login and token issuance");

const profile = await request("/api/v1/users/me", { token: accessToken });
assert.equal(profile.status, 200, JSON.stringify(profile.data));
assert.equal(profile.data.data.password, undefined);
console.log("PASS authenticated profile and password redaction");

const adminCheck = await request("/api/v1/users/admin-check", { token: accessToken });
assert.equal(adminCheck.status, 403, JSON.stringify(adminCheck.data));
console.log("PASS role authorization rejects regular user");

const refreshed = await request("/api/v1/auth/refresh", {
  method: "POST",
  body: { refreshToken },
});
assert.equal(refreshed.status, 200, JSON.stringify(refreshed.data));
assert.ok(refreshed.data.data.refreshToken);
console.log("PASS refresh-token rotation");

const logout = await request("/api/v1/auth/logout", {
  method: "POST",
  token: refreshed.data.data.accessToken,
});
assert.equal(logout.status, 200, JSON.stringify(logout.data));

const revokedRefresh = await request("/api/v1/auth/refresh", {
  method: "POST",
  body: { refreshToken: refreshed.data.data.refreshToken },
});
assert.equal(revokedRefresh.status, 401, JSON.stringify(revokedRefresh.data));
console.log("PASS logout revokes refresh token");
