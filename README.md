# Jincor Auth
![Jincor logo](https://raw.githubusercontent.com/JincorTech/backend-auth/master/Logo.png)

Jincor Auth is a service that manages JWT-authentication, it's main responsibilities are:

1. Users management.
2. Generation of JWT tokens.
3. Validation of JWT tokens.

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
For more information, see [API Blueprint](./apiary.apib)

1. `/tenant` POST - register a tenant.
1. `/tenant/login` POST - login a tenant.
1. `/tenant/logout` POST - logout a tenant.
1. `/tenant/verify` POST - verify tenant's JWT token.
1. `/user` POST - create a new user.
1. `/user/{login}` DELETE - delete specific user.
1. `/auth/` POST - log user in.
1. `/auth/verify` POST - verify the given token.
1. `/auth/logout` POST - logout user.

## How to build

### For development

1. Clone this repo.
1. Run `docker-compose build --no-cache`.
1. Start development containers: `docker-compose up -d`.
1. If you want to update/install dependency run: `docker-compose exec auth npm i some-dep`.
IMPORTANT: To keep your changes in container you have to commit it: `docker commit registry.jincor.com/backend/auth-develop:latest`.
1. To run tests run `docker-compose exec auth npm test`

### For production
1. Clone this repo.
1. Run `docker-compose -f docker-compose.prod.yml build --no-cache`.
1. To start prod containers: `docker-compose -f docker-compose.prod.yml up -d`.
1. Push to registry: `docker push registry.jincor.com/backend/auth:latest`.
