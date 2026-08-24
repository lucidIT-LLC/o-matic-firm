# Security — o-MATIC Firm

## What is in this repository

Markdown instruction files and JSON manifests. **No executable code, no MCP
server, no network client, no build step, no dependencies.** A host reads the
`SKILL.md` files as text.

| Property | Status |
|---|---|
| Ships credentials | **No.** No token, key, password or DSN appears here. |
| Opens network connections | **No.** Nothing here can connect to anything. |
| Connects to a database | **No.** The host owns the transport. |
| Declares an MCP server | **No.** By design — see `README.md`. |
| Executes on install | **No.** Files are read, nothing runs. |
| Collects telemetry | **No.** |

## What the instructions forbid

- **Never hold, enter, relay or store a credential.** Credential entry routes
  back to the operator.
- **Reach the database only through the O-Matic Server's governed MCP surface.**
  Active halt-rule #288 forbids a hand-built psql or DSN connection that bypasses
  the server, and forbids deriving authority from local configuration.
- **Treat a grant refusal as a refusal**, never as an empty result.
- **Do not echo database error text.** The server returns SQLSTATE only, because
  a Postgres `DETAIL` can quote values from the failing row.

These are instructions to a model, not enforced controls. **Enforcement lives on
the O-Matic Server**, which holds credentials, issues one token per client, and
grants each client only named connections.

## Reporting

Report suspected issues to the repository owner (`lucidIT-LLC`). Never open a
public issue containing a credential, token or connection string.
