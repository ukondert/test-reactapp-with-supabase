import React, { useEffect, useState } from 'react';
import { getHealthStatus } from '../core/api/healthApi';
import { StatusMessage } from '@shared/ui';

const SupabaseHealthCheck = () => {
    const [status, setStatus] = useState('Verbindung wird geprüft...');
    const [tone, setTone] = useState('info');

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const result = await getHealthStatus();
                setStatus('✅ API erreichbar (HTTP ' + result.statusCode + ')');
                setTone('success');
            } catch (e) {
                setStatus('❌ Fehler: ' + e.message);
                setTone('error');
            }
        };

        checkConnection();
    }, []);

    return (
        <div>
            <StatusMessage text={status} tone={tone} />
        </div>
    );
};

export default SupabaseHealthCheck;