"use client";

import { useEffect, useState } from 'react';

export default function Debug() {
    const [status, setStatus] = useState('Checking...');
    const [cookieInfo, setCookieInfo] = useState('');

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/me', {
                credentials: 'include'
            });

            if (res.ok) {
                const data = await res.json();
                setStatus(`Authenticated as ${data.email}`);
            } else {
                setStatus(`Not Authenticated (Status: ${res.status})`);
            }
        } catch (e: any) {
            setStatus(`Error: ${e.message}`);
        }
    };

    const login = async () => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'valid_user@example.com', password: 'Password123!' }), // Use the valid user created by seed_user.js
                credentials: 'include'
            });
            const data = await res.json();
            setCookieInfo(JSON.stringify(data, null, 2));
            checkAuth();
        } catch (e: any) {
            setCookieInfo(`Login Error: ${e.message}`);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Debug Auth</h1>
            <div className="mb-4">
                <p>Status: <strong>{status}</strong></p>
                <button onClick={checkAuth} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Check Auth (/me)</button>
                <button onClick={login} className="bg-green-500 text-white px-4 py-2 rounded">Force Login (Test User)</button>
            </div>
            <pre className="bg-gray-100 p-4 rounded">{cookieInfo}</pre>
        </div>
    );
}
