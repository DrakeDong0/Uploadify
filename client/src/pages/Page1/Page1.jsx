import React, { useEffect, useState } from 'react';
import Panel from '../../Components/Panel/Panel';
import './Page1.css';

export default function Page1() {
    const [TokenVar, setTokenVar] = useState(null);
    const [RefreshVar, setRefreshVar] = useState(null);
    const [authCode, setAuthCode] = useState(null);
    const [hasError, setHasError] = useState(false);
    const refreshAccessToken = async (refreshToken) => {
        try {
            const response = await fetch('http://localhost:8000/refresh_token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken: refreshToken }),
            });
            const data = await response.json();
            if (data.access_token) {
                setTokenVar(data.access_token);
            }
        } catch (error) {
            console.error('Error refreshing access token:', error);
            setHasError(true);
        }
    };

    useEffect(() => {
        let refreshTimeout;

        const getAuthCodeFromURL = () => {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('code');
        };

        const exchangeToken = async (code) => {
            try {
                const response = await fetch('http://localhost:8000/exchange_token/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code:code }),
                });
                const data = await response.json();
                if(data.access_token){
                    setTokenVar(data.access_token);
                    setRefreshVar(data.refresh_token);
                    const expiresIn = data.expires_in;
                    refreshTimeout = setTimeout(() => {
                        refreshAccessToken(RefreshVar);
                    }, (expiresIn - 300) * 1000);
                }
            } catch (error) {
                console.error('Error exchanging token:', error);
                setAuthCode(code); 
                setHasError(true);
            }
        };
        const code = getAuthCodeFromURL();
        if (code) {
            setAuthCode(code); 
            exchangeToken(code);
        }
        return () => {
            clearTimeout(refreshTimeout);
        };
    }, []);

    useEffect(() => {
        const errorTimeout = setTimeout(() => {
            setHasError(true);
        }, 5000); 

        return () => {
            clearTimeout(errorTimeout);
        };
    }, []);

    return (
        <>
            {authCode && TokenVar ? (
                <>
                    <Panel token={TokenVar} />
                </>
            ) : (
                <>
                    {hasError ? (
                        <p className="error-text">Login Timed Out - Check the URL or try logging in again.</p>
                    ) : (
                        <p className="loading-text">Loading...</p>
                    )}
                </>
            )}
        </>
    );
}
