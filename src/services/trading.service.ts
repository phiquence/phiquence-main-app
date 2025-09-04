
'use client';

// This function will now call our backend API instead of firestore directly
export const joinTradingHub = async (token: string) => {
    const response = await fetch('/api/trading/join', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to join trading hub.');
    }

    return data;
};

// This function will now call our backend API
export const placeBet = async (token: string, sessionId: string, direction: 'rise' | 'fall', amount: number) => {
    const response = await fetch('/api/trading/bet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId, direction, amount })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to place bet.');
    }
    
    return data;
};
