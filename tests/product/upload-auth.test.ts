import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import type { HttpStack } from "tus-js-client";
import { uploadAuthorization } from "../../src/features/meetings/upload-auth";

const require = createRequire(import.meta.url);
// Exercise tus's actual browser transport: its setHeader calls XHR, which
// appends duplicate values rather than replacing them like the Node transport.
const { DefaultHttpStack } = require("tus-js-client/lib.es5/browser/index.js");
class HeaderXHR {
  headers = new Headers();
  open() {}
  setRequestHeader(name: string, value: string) {
    this.headers.append(name, value);
  }
}

test("browser uploads send one fresh Bearer token on creation, chunks and resume", async (t) => {
  Object.defineProperty(globalThis, "XMLHttpRequest", { value: HeaderXHR, configurable: true });
  t.after(() => Reflect.deleteProperty(globalThis, "XMLHttpRequest"));
  let token = "initial-token";
  const auth = uploadAuthorization("owner", "public-key", async () => ({
    data: { session: { user: { id: "owner" }, access_token: token } },
  }));
  const stack: HttpStack = new DefaultHttpStack();
  for (const [index, method] of ["POST", "PATCH", "HEAD", "PATCH"].entries()) {
    token = `refreshed-token-${index}`;
    const request = stack.createRequest(method, "https://storage.example/upload");
    for (const [name, value] of Object.entries(auth.headers!))
      request.setHeader(name, value);
    await auth.onBeforeRequest!(request);
    const xhr = request.getUnderlyingObject() as HeaderXHR;
    assert.equal(xhr.headers.get("authorization"), `Bearer ${token}`);
    assert.equal(xhr.headers.get("apikey"), "public-key");
  }
});

test("upload requests stop if the session expires or the account changes", async (t) => {
  Object.defineProperty(globalThis, "XMLHttpRequest", { value: HeaderXHR, configurable: true });
  t.after(() => Reflect.deleteProperty(globalThis, "XMLHttpRequest"));
  for (const session of [null, { user: { id: "other" }, access_token: "other-token" }]) {
    const auth = uploadAuthorization("owner", "public-key", async () => ({
      data: { session },
    }));
    const stack: HttpStack = new DefaultHttpStack();
    const request = stack.createRequest("PATCH", "https://storage.example/upload");
    await assert.rejects(async () => auth.onBeforeRequest!(request), /account changed/);
    assert.equal((request.getUnderlyingObject() as HeaderXHR).headers.has("authorization"), false);
  }
});
