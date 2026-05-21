import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

export function GoogleLoginButton({ onSuccess, onError, disabled }) {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) return null;

    return (
        <div style={{ marginTop: '1rem' }}>
            <GoogleLogin
                onSuccess={onSuccess}
                onError={onError}
                theme="outline"
                size="large"
                width="100%"
                text="continue_with"
                locale="pt-BR"
                disabled={disabled}
            />
        </div>
    );
}
