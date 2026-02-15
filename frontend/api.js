const API_BASE_URL = 'https://iman-firman-ai.vercel.app/api';

class APIClient {
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Chatbot endpoints
    async createConversation(userId, title) {
        return this.request('/chatbot/new', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId, title: title })
        });
    }

    async sendMessage(conversationId, message) {
        return this.request(`/chatbot/${conversationId}/message`, {
            method: 'POST',
            body: JSON.stringify({ message: message })
        });
    }

    async getConversation(conversationId) {
        return this.request(`/chatbot/${conversationId}`);
    }

    async listConversations(userId) {
        return this.request(`/chatbot/conversations?user_id=${userId}`);
    }

    // Text Generation endpoints
    async generateText(prompt, maxLength = 100, temperature = 0.7) {
        return this.request('/text-generation/generate', {
            method: 'POST',
            body: JSON.stringify({ 
                prompt: prompt, 
                max_length: maxLength,
                temperature: temperature,
                user_id: 1
            })
        });
    }

    async getTextGenerationTemplates() {
        return this.request('/text-generation/templates');
    }

    // Image Processing endpoints
    async processImage(imageUrl, task) {
        return this.request('/image-processing/process', {
            method: 'POST',
            body: JSON.stringify({ 
                image_url: imageUrl, 
                task: task,
                user_id: 1
            })
        });
    }

    async getImageProcessingTasks() {
        return this.request('/image-processing/tasks');
    }

    // NLP endpoints
    async processNLP(text, task) {
        return this.request('/nlp/process', {
            method: 'POST',
            body: JSON.stringify({ 
                text: text, 
                task: task,
                user_id: 1
            })
        });
    }

    async getNLPTasks() {
        return this.request('/nlp/tasks');
    }

    // Analytics endpoints
    async analyzeData(data, analysisType) {
        return this.request('/analytics/analyze', {
            method: 'POST',
            body: JSON.stringify({ 
                data: data, 
                analysis_type: analysisType,
                user_id: 1
            })
        });
    }

    async getAnalysisTypes() {
        return this.request('/analytics/types');
    }
}

const apiClient = new APIClient();
