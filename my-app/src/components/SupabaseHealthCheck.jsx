import React, { useEffect, useState } from 'react';
import { getHealthStatus } from '../core/api/healthApi';

const SupabaseHealthCheck = () => {
    const [status, setStatus] = useState('Verbindung wird geprüft...');

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const result = await getHealthStatus();
                setStatus('✅ API erreichbar (HTTP ' + result.statusCode + ')');
            } catch (e) {
                setStatus('❌ Fehler: ' + e.message);
            }
        };

        checkConnection();
    }, []);

    return (
        <div>
            <h2>{status}</h2>
        </div>
    );
};

export default SupabaseHealthCheck;