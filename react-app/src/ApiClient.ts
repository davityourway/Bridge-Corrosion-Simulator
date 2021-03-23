export const doFetch = async (path: string, body?: any) => {
    const response = await fetch(`http://localhost:5000/api${path}`, ({
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST'
    }));
    if (!response.ok) {
        const responseBody = await response.json();
        console.log(responseBody);
    }
    return response;
};