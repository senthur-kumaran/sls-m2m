exports.securedHandler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Access granted! You have valid credentials." }),
  };
};
