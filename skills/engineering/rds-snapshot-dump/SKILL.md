---
name: rds-snapshot-dump
description: "Use when someone needs to download, retain, export, restore, or create a portable pg_dump from an Amazon RDS for PostgreSQL snapshot, especially when the snapshot is automated, encrypted, private, or pg_dump connectivity fails."
---

# RDS snapshot dump

## Overview

Use this workflow with any AWS account, profile, Region, environment, or RDS for PostgreSQL instance. Never assume project-specific names, network topology, credentials, or retention requirements.

An RDS snapshot is an AWS-managed physical backup and cannot be downloaded directly. First identify the required artifact:

| Goal | Correct artifact | Restorable? |
|---|---|---|
| Durable RDS rollback | Manual RDS snapshot or copy | To a new RDS instance |
| Analytics/data lake | RDS snapshot export to S3 | Parquet only; not directly restorable |
| Portable database backup | Temporary restore followed by `pg_dump` | With `pg_restore` |

Keep the source instance untouched. Treat every create, copy, restore, modify, and delete operation as a write requiring explicit approval. Discovery commands are read-only.

## Portable dump workflow

### 1. Discover and record facts

Ask for or discover the intended AWS profile, Region, source DB, and desired snapshot age. Use explicit variables rather than defaults:

```bash
export PROFILE='<aws-profile>'
export REGION='<aws-region>'
export SOURCE_DB='<source-db-instance-id>'
```

Identify the latest available snapshot and inspect it:

```bash
aws rds describe-db-snapshots --profile "$PROFILE" --region "$REGION" \
  --db-instance-identifier "$SOURCE_DB" \
  --query 'max_by(DBSnapshots[?Status==`available`], &SnapshotCreateTime).{id:DBSnapshotIdentifier,arn:DBSnapshotArn,created:SnapshotCreateTime,type:SnapshotType,engine:Engine,version:EngineVersion,encrypted:Encrypted,kms:KmsKeyId}'
```

Inspect the source instance's database name, master username, subnet group, security groups, public-access flag, instance class, and VPC. Never infer identifiers or networking from names.

### 2. Choose connectivity before restoring

Prefer an approved private path already available: VPN, Client VPN, SSM tunnel, bastion, or an exporter inside the VPC. Verify it actually exists before planning around it.

For direct laptop access when no private path exists:

1. Find two public subnets in different Availability Zones whose route tables point to an Internet Gateway.
2. Create a dedicated temporary DB subnet group from those subnets.
3. Create a dedicated temporary security group allowing TCP 5432 only from the operator's current public IPv4 `/32`.
4. Restore a new temporary instance **directly** into that subnet group with `--publicly-accessible`.

Do not try to move an existing restored instance to another DB subnet group in the same VPC. RDS can reject this with `InvalidVPCNetworkStateFault`; delete that temporary copy and restore a replacement directly into the intended subnet group. Never broaden access to `0.0.0.0/0`.

### 3. Restore only a temporary instance

Set unique temporary identifiers and use the smallest compatible instance class:

```bash
export SNAPSHOT_ID='<snapshot-id-or-arn>'
export TEMP_DB='<unique-temporary-db-id>'
export DB_CLASS='<compatible-instance-class>'
export TEMP_SUBNET_GROUP='<temporary-subnet-group>'
export TEMP_SG='<temporary-security-group-id>'
```

```bash
aws rds restore-db-instance-from-db-snapshot \
  --profile "$PROFILE" --region "$REGION" \
  --db-instance-identifier "$TEMP_DB" \
  --db-snapshot-identifier "$SNAPSHOT_ID" \
  --db-instance-class "$DB_CLASS" \
  --db-subnet-group-name "$TEMP_SUBNET_GROUP" \
  --vpc-security-group-ids "$TEMP_SG" \
  --storage-type gp3 \
  --publicly-accessible \
  --no-multi-az \
  --no-deletion-protection

aws rds wait db-instance-available \
  --profile "$PROFILE" --region "$REGION" \
  --db-instance-identifier "$TEMP_DB"
```

For private connectivity, replace the public subnet and security-group settings and use `--no-publicly-accessible`.

Read the endpoint instead of guessing it:

```bash
PGHOST="$(aws rds describe-db-instances \
  --profile "$PROFILE" --region "$REGION" \
  --db-instance-identifier "$TEMP_DB" \
  --query 'DBInstances[0].Endpoint.Address' --output text)"
```

Confirm `PubliclyAccessible`, the attached security group, DNS resolution, and TCP 5432 reachability. On macOS, `nc -G 5 -vz "$PGHOST" 5432` gives a bounded connection test; use the platform-equivalent TCP probe elsewhere.

### 4. Match PostgreSQL client versions

Read `EngineVersion` from the snapshot. `pg_dump` refuses to dump from a server newer than its own major version. Prefer the same major version as the restored server, then invoke that binary explicitly.

The restored instance keeps the snapshot's database credentials. Locate the owning application's database secret without printing it into chat or command history. Load only the decoded password into `PGPASSWORD`, use it, then `unset PGPASSWORD`. Credential storage varies by environment; inspect RDS managed secrets, Secrets Manager, ECS task definitions, deployment configuration, or the approved secret store rather than guessing.

### 5. Create and verify the archive

```bash
export PG_DUMP='<path-to-compatible-pg_dump>'
export PG_RESTORE='<path-to-compatible-pg_restore>'
export DB_USER='<database-user>'
export DB_NAME='<database-name>'
export DUMP_FILE='<output.dump>'
```

```bash
PGSSLMODE=require "$PG_DUMP" \
  --host "$PGHOST" --port 5432 \
  --username "$DB_USER" --dbname "$DB_NAME" \
  --format custom --verbose --no-owner --no-acl \
  --file "$DUMP_FILE"

"$PG_RESTORE" --list "$DUMP_FILE" >/dev/null
```

`pg_dump` has no percentage display. `--verbose` reports objects; watch the file grow from another terminal when needed.

### 6. Clean up after verification

After `pg_restore --list` succeeds and the user approves cleanup:

1. Delete only the temporary restored instance with `--skip-final-snapshot --delete-automated-backups`.
2. Wait for `db-instance-deleted`.
3. Delete temporary security groups, subnet groups, bastions, tasks, or export artifacts created for this operation.
4. Confirm the source instance and any intentionally retained snapshot still exist.

## Common mistakes

- Calling S3 Parquet export a PostgreSQL backup: it cannot be restored directly.
- Depending on an automated snapshot for long-term retention: copy it to a manual snapshot first.
- Modifying or deleting the source instead of a clearly named temporary restore.
- Restoring privately before deciding how the dump host will connect.
- Assuming a NAT gateway enables inbound laptop access.
- Reusing production security groups or opening PostgreSQL globally.
- Trying to move a restored DB between subnet groups in the same VPC instead of restoring it correctly.
- Using an older `pg_dump` major version.
- Printing credentials into chat, logs, or shell history.
- Declaring completion before verifying the archive and removing public temporary resources.
