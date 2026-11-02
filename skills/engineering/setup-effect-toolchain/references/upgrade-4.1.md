# Upgrading effect 4.0.x to 4.1.x

`effect` 4.1.0 broke these APIs. Before bumping, search the repo for each symbol and port every hit. After bumping, `typecheck` catches the type changes. Rows 1 and 8 are runtime changes that compile unchanged, so review them by hand.

| # | Symbol | 4.1 behaviour | Port |
|---|---|---|---|
| 1 | `effect/Crypto` | Replaced by one service per family under `effect/crypto/*` (`Aead`, `Cipher`, `Digest`, `Kdf`, `KeyAgreement`, `KeyWrap`, `Mac`, `SecureRandom`, `Signature`, `WebCrypto`), with opaque keys and `CryptoError`. | Import the family module, e.g. `import * as Digest from "effect/crypto/Digest"`. Encoding a secret or private key through a byte or format schema needs `{ allowEncode: true }`. |
| 2 | `Migrator.fromFileSystem` | Moved to `effect/sql/MigratorFileSystem`. The `effect/sql` barrel no longer exports it. | `import * as MigratorFileSystem from "effect/sql/MigratorFileSystem"`, then `MigratorFileSystem.fromFileSystem(dir)`. |
| 3 | `Toml.parse` (`effect/encoding/Toml`) | Returns `Result<Record<string, unknown>, EncodingError>` instead of throwing. It also rejects extending an inline table or a static array, and out-of-range dates such as `1979-02-30`. | Handle the `Result` (`Result.isSuccess`, or lift it into an Effect), and remove the `try`/`catch` around the call. |
| 4 | `sql.insert`, `sql.updateValues` | Rows must be a non-empty array at the type level. | Narrow with `Array.isReadonlyArrayNonEmpty(rows)`, and handle the empty case before the call. |
| 5 | `HttpClient.withCookiesRef` (`effect/http/HttpClient`) | Takes a `Ref<ReadonlyArray<Cookie>>`, and sends stored cookies only to a matching host, path and scheme. | Seed the ref with `Cookies.mergeIntoArray`, or with cookies that set a `domain`. |
| 6 | `McpServer` (`effect/ai/McpServer`) | Registration layers go through the transport's `registrations` option. | Pass the layers as `registrations`, and capture construction-time handler services with `Layer.unwrap` instead of `Layer.provide`. |
| 7 | `AiError.HttpRequestDetails`, `Response.HttpRequestDetails` | Removed. `AiError.NetworkError` has `method` and `url` fields instead of `request`, and `request` is gone from `AiError.HttpContext` and `Response.ResponseMetadataPart`. | Read `error.method` and `error.url`. Request headers and query parameters are no longer on errors or response metadata. |
| 8 | RPC calls with `discard: true` | Complete when the server acknowledges the call, not when the request is written. | Check callers that relied on the call returning before the server answers, such as fire-and-forget calls during shutdown or sends to an unreachable server. |

Source: the `effect@4.1.0` release notes (`gh api repos/Effect-TS/effect/releases/tags/effect@4.1.0`). Every later release is in `gh release list -R Effect-TS/effect`.

Done when no hit of a row's symbol keeps its 4.0 form, `typecheck` passes, and every caller from rows 1 and 8 is reviewed.
