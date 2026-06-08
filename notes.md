### OIDC authorization code flow
Yes
### PKCE
Yes
### DPoP
Early access only
### Discovery metadata (JWKS)
Yes
### Secure encryption etc.
Yes
### EC algorithms
(EC) algorithms are not supported for Auth0's native tenant signing keys
### Private key JWT client authentication
Enforces JAR required, but express module does not support it out of the box - requires manual setup of constructing JAR + sending to auth0 with callback
### Refresh tokens with configurable TTL
Configurable in app
### RP-initiated logout
Configurable in app
### Back-channel logout (from IdP)
Configurable in app
### MFA enforcement
Configurable in app
### FIDO2/Passkeys
Yes (database > authentication methods)
### Mechanism to enforce organisation membership on sign-in
Yes
### Federation with Cabinet Office google/DSIT Entra for internal users
Yes
### Reauthentication (prompt=login)
Yes
### Realtime alert on confirmed security incident and/or breach
Yes https://auth0.com/docs/secure/security-center
### Level 1 & 2 programme security requirements (as relevant)
Assumed yes?
### Authentication audit events
Yes https://auth0.com/docs/secure/security-center
### Stream audit events to OL SIEM tooling (Cribl?) (selective and determined by OL SecOps)
https://auth0.com/docs/customize/log-streams
### Automated threat detection
Yes
### Bot protection
Yes
### Data protection/privacy controls?
Yes
### Resilience to common attack patterns on the internet (TBD)
Yes (hardened against common threads)
### Must meet GDS service standard for usability/accessibility
Yes (to WCAG 2.2 AA)
### 99.9% availability
Yes (99.9%)
### SLAs for incident response (TBD)
Yes (pricing dependent, but 2 hours for P1 on basic plan)
### Capacity for at least 10,000 users and 250 organisations
Yes
### Scales to support at least 500 logins/day
Yes
### Backup/recovery with RPO/RTO <TBD>
Yes (although manually using API to export users)
### Full Lifecycle instantiation to decommissioning

### Support for transfer to another provider?
Can export users using API

Have gone through the RP auth requirements. The main thing i've noticed is that EC algorithms are currently not supported by Auth0.

To invite users it also looks a bit more involved https://auth0.com/docs/customize/email/send-email-invitations-for-application-signup

We need to implement the construction of JWTs manually for auth (JAR) - see here https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow/authorization-code-flow-with-jar
This is because the `express-openid-connect` package doesn't support sending request objects

Annoyingly, we cant use half `express-openid-connect` - half our own implementation because if we use eOIDC for the callback it wont know about PKCE. We would have to use the `openid-connect` package directly and manually do a bunch of bits.

I've got a branch BAU/testing-auth0 which has an implementation that matches our needs. It can probably be simplified but it works for now!

Tested locally and I can login, logout, and reauth. To implement in dev, we should just need to setup some secrets/parameters
