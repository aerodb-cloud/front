const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export class ApiClient {
    private static cachedToken: string | null = null;
    private static tokenFetchedAt: number = 0;

    private static async getSessionToken() {
        // Cache token for short time to avoid polling /api/auth/session repeatedly
        if (this.cachedToken && Date.now() - this.tokenFetchedAt < 60000) {
            return this.cachedToken;
        }

        const res = await fetch('/api/auth/session');
        const session = await res.json();
        this.cachedToken = session?.accessToken || null;
        this.tokenFetchedAt = Date.now();
        return this.cachedToken;
    }

    static async request(endpoint: string, options: RequestInit = {}) {
        const token = await this.getSessionToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...((options.headers as Record<string, string>) || {}),
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        let response: Response;
        try {
            response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers,
            });
        } catch (e: any) {
            console.error("ApiClient Fetch Error:", e);
            throw new Error(`Network Error: ${e.message || 'Unknown network error'}`);
        }

        if (!response.ok) {
            let errorData: any = null;
            try {
                errorData = await response.json();
            } catch (e) {
                // If json parsing fails, ignore and use status text
            }
            
            const errorMessage = errorData?.details 
                ? `${errorData.error}\nDetalles técnicos: ${errorData.details}` 
                : (errorData?.error || `API Error: ${response.status} ${response.statusText}`);
                
            throw new Error(errorMessage);
        }

        return response.json();
    }

    static async get(endpoint: string) {
        return this.request(endpoint);
    }

    static async post(endpoint: string, body: any) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    static async patch(endpoint: string, body: any) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    }


    static async delete(endpoint: string, body?: any) {
        const options: RequestInit = { method: 'DELETE' };
        if (body) {
            options.body = JSON.stringify(body);
        }
        return this.request(endpoint, options);
    }

    // Branches
    static async getImportStatus(slug: string, branchId: string) {
        return this.get(`/projects/${slug}/branches/${branchId}/import/status`);
    }
}
