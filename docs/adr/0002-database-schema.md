# ADR 0002 - Database Schema

## Context

The One Login Admin Tool (Admin Tool) will need to store information on Services, Clients, Users, and Permissions, and the relationships between all four, particularly which Clients are associated with which Services, and Users and their Permissions to Services. It is expected that the Admin Tool will need to scale to 100s of service integrations, 1000s of clients and users, and 10s of updates per day.

## Options

### Option 1 - DynamoDB Zanzibar (Selected)

While DynamoDB is much more restrictive in how it can be queried (in comparison to SQL/other relational databases), we can design the database structure with a Zanzibar approach to be close to a relational database structure. If approach the schema with the notion that objects accessed together should be stored together, we can combine our objects into most used cases, which is Services and Clients, and Users and Permissions.

#### Services and Clients table schema

#### Schema

| Column | Description | Format |
|--------|-------------|--------|
| serviceId | Service ID | {serviceId} |
| sk | Literal ‘service’ for service entries, or a client tuple with environment and client ID. | `service` / `client#{environment}#{clientId}` |
| name | service/client name | <free text> |
| env | environment | `production` / `integration` |
| clientId | Client ID | {clientId} |

#### Example

| serviceId | sk | env | clientId | name |
|-----------|----|-----|----------|------|
| 1 | service | <free text> | <free text> | Find a Tender |
| 1 | client#production#1 | production | 1 | Production |
| 1 | client#integration#2 | integration | 2 | UAT |
| 1 | client#integration#3 | integration | 3 | Staging |
| 2 | service | <free text> | <free text> | HMRC |
| 2 | client#int#4 | integration | 4 | Test |

#### Users and Permissions table schema

#### Schema

| Column | Description | Format |
|--------|-------------|--------|
| subject | User (or in future, group) ID | `user:{userId}` |
| sk | Literal ‘user’ for user entries, or a relation tuple with object and permission. | `user` / `relation#service:{serviceId}#{relation}` |
| object | Service ID | `service:{serviceId}` |
| relation | Permission (or in future, group membership or other structure) | `reader` / `writer_int` / `writer_prod` / `manager` |
| email | Email address | <email> |

#### Example

| subject | sk | object | relation | email |
|---------|----|--------|----------|-------|
| user:1 | user | <free text> | <free text> | alice@example.com |
| user:1 | relation#service:1#reader | service:1 | reader | <free text> |
| user:1 | relation#service:2#manager | service:2 | manager | <free text> |
| user:2 | user | <free text>| <free text> | bob@example.com |
| user:2 | relation#service:1#reader | service:1 | reader | <free text> |
| user:2 | relation#service:3#writer_int | service:3 | writer_int | <free text> |
| user:3 | user | <free text> | <free text> | carl@example.com |
| user:3 | relation#service:*#reader | service:* | reader | <free text> |

### Option 2 - DynamoDB Non-Zanzibar (Discounted)

The most frequently used approach for DynamoDB is to have a single table for each required entity, this would cause a number of drawbacks for this scenario. Because we would require information on multiple entities, we would have to query multiple tables and perform joins on the information required. This would cause issues such as joins being performed in the application layer and multiple requests required for a single query, which in turn would cause the application layer to be more complex. Over time, this would make it harder to maintain consistency of relations and be less performant as the Admin Tool scales.

### Option 3 - Relational Database (Discounted)

While relation databases, such as SQL, can perform quick queries and are tailored for use cases such as the Admin Tool, the team working on the Admin Tool (and the programme as a whole) does not frequently use SQL. This would make it more difficult to maintain and slower to build.

## Consequences

### Benefits

- DynamoDB is the default choice across the programme, and any alternative will require a lengthy approvals process with a strong reason to back it up.
- The team working on the Admin Tool already has knowledge on DynamoDB, so no ramp up is required.

### Trade-offs

- Because DynamoDB is much more difficult to update the queries used against the tables, we must take the time to carefully plan out the schema for future cases (post-MVP) of the Admin Tool.
