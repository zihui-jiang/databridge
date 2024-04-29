

exports.handler = async (event:any) => {
    // Process the event received:
    console.log(event);
    return {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ message: "Hello, World!" }),
    };
};