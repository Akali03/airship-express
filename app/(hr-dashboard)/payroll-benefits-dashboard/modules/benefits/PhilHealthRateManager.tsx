'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button } from '../../components/ui';
import { useApi } from '../../hooks/api/useApi';

const PhilHealthRateManager = () => {
    const [rates, setRates] = useState([]);
    const { fetchData } = useApi('/payroll-benefits-dashboard/api/benefits/philhealth');

    useEffect(() => {
        fetchData().then(setRates).catch(console.error);
    }, []);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">PhilHealth Premium Rates (2.5% each)</h3>
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.Head>Employer Rate</Table.Head>
                        <Table.Head>Employee Rate</Table.Head>
                        <Table.Head>Maximum Premium Cap</Table.Head>
                        <Table.Head>Effective Date</Table.Head>
                        <Table.Head>Actions</Table.Head>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {rates && rates.length > 0 ? (
                        rates.map((rate: any) => (
                            <Table.Row key={rate.id}>
                                <Table.Cell>{(rate.employer_rate * 100).toFixed(1)}%</Table.Cell>
                                <Table.Cell>{(rate.employee_rate * 100).toFixed(1)}%</Table.Cell>
                                <Table.Cell className="font-bold">₱{rate.premium_cap}</Table.Cell>
                                <Table.Cell>{new Date(rate.effective_date).toLocaleDateString()}</Table.Cell>
                                <Table.Cell>
                                    <Button size="sm" variant="outline">Edit</Button>
                                </Table.Cell>
                            </Table.Row>
                        ))
                    ) : (
                        <Table.Row>
                            <Table.Cell colSpan={5} className="text-center text-muted py-4">
                                No PhilHealth rates found.
                            </Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table>
        </div>
    );
};

export default PhilHealthRateManager;