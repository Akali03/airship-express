'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Badge } from '../../components/ui';
import { useApi } from '../../hooks/api/useApi';

const PagIbigTierManager = () => {
    const [tiers, setTiers] = useState([]);
    const { fetchData } = useApi('/payroll-benefits-dashboard/api/benefits/pagibig');

    useEffect(() => {
        fetchData().then(setTiers);
    }, []);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pag-IBIG Contribution Tiers</h3>
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.Head>Tier Name</Table.Head>
                        <Table.Head>Salary Range</Table.Head>
                        <Table.Head>Employer Rate</Table.Head>
                        <Table.Head>Employee Rate</Table.Head>
                        <Table.Head>Max Employer Share</Table.Head>
                        <Table.Head>Max Employee Share</Table.Head>
                        <Table.Head>Actions</Table.Head>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {tiers.map((tier) => (
                        <Table.Row key={tier.id}>
                            <Table.Cell><Badge variant="outline">{tier.tier_name}</Badge></Table.Cell>
                            <Table.Cell>
                                ₱{tier.salary_min} - {tier.salary_max ? `₱${tier.salary_max}` : 'Above'}
                            </Table.Cell>
                            <Table.Cell>{(tier.employer_rate * 100).toFixed(0)}%</Table.Cell>
                            <Table.Cell>{(tier.employee_rate * 100).toFixed(0)}%</Table.Cell>
                            <Table.Cell>{tier.max_employer_share ? `₱${tier.max_employer_share}` : 'No Cap'}</Table.Cell>
                            <Table.Cell>{tier.max_employee_share ? `₱${tier.max_employee_share}` : 'No Cap'}</Table.Cell>
                            <Table.Cell>
                                <Button size="sm" variant="outline">Edit</Button>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        </div>
    );
};

export default PagIbigTierManager;