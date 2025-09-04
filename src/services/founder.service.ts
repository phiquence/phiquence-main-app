
'use client';

export const becomeFounder = async (token: string): Promise<{ ok: boolean, message: string }> => {
    const response = await fetch('/api/founder/join', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to become a founder.');
    }
    
    return data;
};
