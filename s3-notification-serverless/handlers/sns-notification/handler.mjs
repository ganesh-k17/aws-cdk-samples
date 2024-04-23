export const main = async (event) => {
    console.log("check!");
    // Log sqs event
    console.log("sqs event", JSON.stringify(event));
    const response = {
      statusCode: 200,
      body: JSON.stringify("logged sqs event"),
    };
    return response;
  };