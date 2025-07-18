const API_URL = 'http://localhost:5000/api';

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

export const clearHistory = async (sessionId = 'api-user') => {
    try {
        const response = await fetch(`${API_URL}/clear-history`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
            throw new Error('Failed to clear chat history');
        }

        return await response.json();
    } catch (error) {
        console.error('Error clearing chat history:', error);
        throw error;
    }
};
