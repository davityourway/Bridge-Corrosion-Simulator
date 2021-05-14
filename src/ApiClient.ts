export const doFetch = async (path: string, body?: any) => {
    const response = await fetch(`/api${path}`, ({
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST'
    }));
    if (!response.ok) {
        const responseBody = await response.json();
        console.error('Error:', responseBody);
    }
    return response.json();
};