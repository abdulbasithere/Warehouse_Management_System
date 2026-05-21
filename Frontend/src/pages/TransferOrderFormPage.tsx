import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui';

export const TransferOrderFormPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-2xl font-bold uppercase tracking-tight">Create Transfer Order</h1>
            <p className="text-neutral-500">Transfer order form goes here.</p>
            <Button onClick={() => navigate('/transfer-orders')}>Back to List</Button>
        </div>
    );
};

export default TransferOrderFormPage;
