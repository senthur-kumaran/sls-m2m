# Serverless M2M Authentication Example

This is an example of a Serverless application that integrates AWS Cognito for authentication with a Machine-to-Machine (M2M) approach using the Client Credentials flow. It uses AWS Lambda functions to handle secured API access with token-based authentication.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 20.x)
- [AWS CLI](https://aws.amazon.com/cli/)
- [Serverless Framework](https://www.serverless.com/)
- An AWS account with the necessary permissions to create Cognito resources and Lambda functions.

## Installation

1. Clone this repository:

```bash
git clone https://github.com/senthur-kumaran/sls-m2m
cd sls-m2m
```

2. Install dependencies:

```bash
npm install
```

3. Configure AWS credentials if not done yet:

```bash
aws configure
```

## Project Structure

- `serverless.yml`: Serverless Framework configuration file. Defines resources such as Cognito User Pool, Cognito Resource Server, User Pool Client, CognitoUserPoolDomain and Lambda functions.
- `handler.js`: The Lambda function that returns a response when accessed with valid credentials.
- `authorizer.js`: Custom Lambda authorizer that verifies the JWT token from Cognito.
- `package.json`: Node.js dependencies, including `jsonwebtoken` and `jwks-rsa` for JWT verification.

## Cognito Setup

The application sets up the following resources in AWS Cognito:

- **User Pool:** A Cognito User Pool is created to manage users and authentication.
- **User Pool Resource Server:** A resource server is created to define access scopes (read and write).
- **User Pool Client:** A client application that uses the Client Credentials OAuth flow to authenticate.
- **User Pool Domain:** A custom domain is set up for Cognito.

## Functions

- **securedFunction:** A secured Lambda function that requires token-based authentication to access. The function returns a success message if the request is valid.
- **tokenAuthorizer:** A custom authorizer Lambda function that verifies JWT tokens using the `jsonwebtoken` and `jwks-rsa` libraries.

## Deployment

Deploy the application to AWS using the Serverless Framework:

```bash
serverless deploy
```

This will create the necessary AWS resources, including the Cognito User Pool, Lambda functions, and API Gateway.

## Testing the API

### Get Client ID & Client Secret

Once your **Serverless deployment** is complete, follow these steps to retrieve the **Client ID** and **Client Secret** from AWS Cognito:

1. Go to ***AWS Console*** → ***Cognito***.
2. Open the ***User Pool*** created (e.g: `sls-m2m`).
3. Navigate to ***Applications*** → ***App clients***.
4. Find the ***Client Name*** (`MyClient`) and copy:
    - Client ID
    - Client Secret

### Generate an Access Token

Use the `Client ID` and `Client Secret` to get an **OAuth token** via the ***Cognito token endpoint***.

##### 1️⃣ Encode Client ID & Secret (Base64)

AWS requires **Basic Authentication**, so encode the **Client ID** and **Client Secret** as follows:
```bash
echo -n "CLIENT_ID:CLIENT_SECRET" | base64
```
The output will be a **Base64-encoded string**.

##### 2️⃣ Get Token via cURL

Use the Cognito **token endpoint** to request a **Bearer token**:
```bash
curl -X POST "https://sls-m2m.auth.us-east-1.amazoncognito.com/oauth2/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Authorization: Basic <BASE64_ENCODED_CLIENT_ID_SECRET>" \
  -d "grant_type=client_credentials&scope=myapi/read"
```
Replace:

- `<BASE64_ENCODED_CLIENT_ID_SECRET>` with your **Base64-encoded** Client ID and Secret.

##### 3️⃣ Response Example

A successful response will return an access token:
```bash
{
  "access_token": "eyJraWQiOiJLT...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

### Use the Token to Call the API

Now, you can use the access token to call your secured API:

```bash
curl -X GET https://<API_ID>.execute-api.us-east-1.amazonaws.com/dev/ \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```
Replace:

- `<API_ID>` with your API Gateway **API ID**.
- `<YOUR_ACCESS_TOKEN>` with your generated **access_token**.

If the token is valid and the correct scope is included, the response will be:

```json
{
  "message": "Access granted! You have valid credentials."
}
```

## Cleanup
To remove the resources created by this application, run:

```bash
serverless remove
```

## Notes
- This application uses the **Client Credentials OAuth Flow** in AWS Cognito to authenticate machine-to-machine communication.
- The JWT token is validated using the public key from the Cognito JWKS endpoint.
