# Jincor Auth
![](https://habrastorage.org/webt/59/d5/42/59d542206afbe280817420.png)

## Why
There are a lot of authentication services. But we were looking for a containerized simple to use solution
with multi tenancy support and suitable for both: user authentication and services/tenants authentication.

Tenant is a user of the system permitted to read and write to database in its scope. If you don't need multi tenancy support, just create 1 tenant and add all users to it.

Service responsibilities

1. Tenant management
1. User management
2. Generation of JWT tokens
3. Validation of JWT tokens
4. Authentication

## How does it work
Jincor Auth service registers users with their username(login/email), company and tenant ID(for multi tenancy support).
When user makes attempt to login with his or her credentials, Auth service is trying to match credentials. If success
it generates unique random session key which is used as part of the JWT secret and stores this session to database. This means
that no one can validate token without making a call to Auth service because the JWT signature created using specific Auth's
secret key and random session id known only by Auth service.
This session mechanism is also used to invalidate tokens. Removing session key from the database will do the trick.


## Common workflow is following:

1. Create a user.
2. Login the user, save received token.
3. Verify saved token whenever authentication required.
4. Logout the user when necessary.
5. Delete the user when his account is not active anymore or deleted.


## API Endpoints
For more information, see [API Documentation](https://jincortech.github.io/backend-auth/index.html)

1. `/user` POST - create a new user
2. `/user/{login}` DELETE - delete specific user
3. `/auth/` POST - log user in
4. `/auth/verify` POST - verify the given token
5. `/auth/logout` POST - logout user
