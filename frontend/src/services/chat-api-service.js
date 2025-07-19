const API_URL = process.env.REACT_APP_BACKEND_URL
    ? `${process.env.REACT_APP_BACKEND_URL}/api`
    : 'http://localhost:5000/api';
export const chatWithLLM = async (question, sessionId = 'api-user') => {
    try {
        const response = await fetch(`${API_URL}/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question, sessionId }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch answer');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching answer:', error);
        throw error;
    }
};

