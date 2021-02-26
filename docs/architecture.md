# Architecture

A simple REST API protected with JWT, validated with JSON Schemas, built on top
of a queue system with a persistent database in the bottom.

Authroization is done via third party Identity Provider services. This identity
is connected to a user in the application database which allows access to the API
endpoints depending on the roles provided and assigned user groups.

When a user interacts with a task, effects are queued and processed in background
jobs. For example when a task is created, the assigned user will recieve a
notification (sms/email/push). Project can also be assigned webhooks to send out
signals whenever a task action occurs.

## Endpoints

See `/swagger` for OpenAPI documentation, or `/swagger.json` for a downloadable
specification.

Brief overview:

```text
GET     /v1/me/task
POST    /v1/me/device
DELETE  /v1/me/device/{device}
GET     /v1/me/profile
PUT     /v1/me/profile
PUT     /v1/me/avatar
GET     /v1/group
POST    /v1/group
GET     /v1/group/{group}
PUT     /v1/group/{group}
GET     /v1/user/{user}/avatar
GET     /v1/project
POST    /v1/project
GET     /v1/project/{project}
PUT     /v1/project/{project}
GET     /v1/project/{project}/label
POST    /v1/project/{project}/label
PUT     /v1/project/{project}/label/{label}
DELETE  /v1/project/{project}/label/{label}
GET     /v1/project/{project}/milestone
POST    /v1/project/{project}/milestone
PUT     /v1/project/{project}/milestone/{milestone}
DELETE  /v1/project/{project}/milestone/{milestone}
POST    /v1/project/{project}/archive
DELETE  /v1/project/{project}/archive
GET     /v1/project/{project}/webhook
POST    /v1/project/{project}/webhook
PUT     /v1/project/{project}/webhook/{webhook}
DELETE  /v1/project/{project}/webhook/{webhook}
GET     /v1/project/{project}/task
POST    /v1/task
POST    /v1/task/{task}/close
POST    /v1/task/{task}/open
GET     /v1/task/{task}/watch
POST    /v1/task/{task}/watch
DELETE  /v1/task/{task}/watch
GET     /v1/task/{task}/action
POST    /v1/task/{task}/action
DELETE  /v1/task/{task}/action/{action}
GET     /v1/task/{task}/attachment
POST    /v1/task/{task}/attachment
GET     /v1/task/{task}/attachment/{attachment}
DELETE  /v1/task/{task}/attachment/{attachment}
GET     /v1/task/{task}/comment
POST    /v1/task/{task}/comment
PUT     /v1/task/{task}/comment/{comment}
POST    /v1/task/{task}/comment/{comment}/stick
DELETE  /v1/task/{task}/comment/{comment}/stick
GET     /v1/task/{task}
PUT     /v1/task/{task}
GET     /v1/search
GET     /v1/health
```

## Roles

* `admin`
* `(read|create|update):group`
* `(read|create|update):project`
* `(read|create|update|comment):task`
* `(create|update):webhook`

## Webhooks

Webhooks are signaled on task events. The HTTP method and extra headers
can be defined on webhook creation.

These are the supported events:

* `task:open` - When created
* `task:close` - When closed
* `task:create` - When updated
* `task:comment` - When a user comments

## Technologies

* Express
* Objection
* Winston
* NodeMailer
* BullMQ
* Caporal
* Ajv
* Mjml
* Vue
* Jest
* OpenAPI
* MySQL
* Redis
* MailHog

Third party services:

* Auth0
* Firebase (optional)
* Sentry (optional)
