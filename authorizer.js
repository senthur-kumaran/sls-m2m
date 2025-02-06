const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

const region = process.env.REGION;
const userPoolId = process.env.COGNITO_USER_POOL_ID;

const COGNITO_ISSUER = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

const client = jwksClient({
    jwksUri: `${COGNITO_ISSUER}/.well-known/jwks.json`,
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) {
            return callback(err, null);
        }
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
    });
}

function generatePolicy(principalId, effect, resource) {
    return {
        principalId,
        policyDocument: {
            Version: "2012-10-17",
            Statement: [
                {
                    Action: "execute-api:Invoke",
                    Effect: effect,
                    Resource: resource,
                },
            ],
        },
    };
}

exports.tokenAuthorizer = async (event, _context, callback) => {
    if (!event.headers || !event.headers.Authorization) {
        return callback("Unauthorized: No token provided");
    }

    const token = event.headers.Authorization.replace("Bearer ", "");

    try {
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, getKey, { issuer: COGNITO_ISSUER, algorithms: ["RS256"] }, (err, decoded) => {
                if (err) {
                    reject(err);
                }
                resolve(decoded);
            });
        });

        const scopes = decoded.scope ? decoded.scope.split(" ") : [];
        if (!scopes.includes("myapi/read")) {
            return callback("Unauthorized: Insufficient scope");
        }

        const policy = generatePolicy(decoded.sub, "Allow", event.methodArn);
        return callback(null, policy);

    } catch (error) {
        console.error("JWT Verification Failed:", error);
        return callback("Unauthorized: Invalid token");
    }
};
