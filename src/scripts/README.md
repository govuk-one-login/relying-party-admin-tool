The validation script in this folder is used to apply our validation rules to existing clients.

### Prerequesites

- You need to authenticate against one of the orch AWS environments. You can either use a profile that has ClientRegistry access, or export the access keys manually in the terminal.
- You also need to set the `ENVIRONMENT` env var to the environment you are running the script against.

### Usage

```bash
npm run build-ts
npm run validate-clients
```

This will output a report of all the clients that have failed validation, as well as a summary of errors by count at the end of the report.
For environments like integration where we have a lot of clients it's recommended to pipe the output to a file so you don't have to scroll through your terminal a lot!
