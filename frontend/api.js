const API_BASE_URL = '/api';

const APIClient = {
    async sendMessage(message) {
        try {
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            if (!response.ok) throw new Error('API Error');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return { error: 'Gagal terhubung ke AI' };
        }
    }
};
