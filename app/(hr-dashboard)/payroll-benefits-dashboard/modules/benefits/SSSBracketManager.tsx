'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, DatePicker } from '../../components/ui'; // Your base UI
import { useApi } from '../../hooks/api/useApi'; // Your API hook

// Assuming you have a service setup for this
const SSSBracketManager = () => {
    const [brackets, setBrackets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBracket, setEditingBracket] = useState(null);
    const { fetchData, postData, putData, deleteData } = useApi('/payroll-benefits-dashboard/api/benefits/sss');

    useEffect(() => {
        loadBrackets();
    }, []);

    const loadBrackets = async () => {
        setLoading(true);
        const data = await fetchData();
        setBrackets(data);
        setLoading(false);
    };

    const handleSave = async (formData) => {
        if (editingBracket) {
            await putData(`/${editingBracket.id}`, formData);
        } else {
            await postData('', formData);
        }
        setIsModalOpen(false);
        loadBrackets();
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to deactivate this bracket?')) {
            await deleteData(`/${id}`);
            loadBrackets();
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <h3 className="text-lg font-semibold">SSS Monthly Salary Credit & Contributions</h3>
                <Button onClick={() => { setEditingBracket(null); setIsModalOpen(true); }}>
                    + Add New Bracket
                </Button>
            </div>

            {loading ? <div>Loading...</div> : (
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.Head>Min Salary</Table.Head>
                            <Table.Head>Max Salary</Table.Head>
                            <Table.Head>MSC</Table.Head>
                            <Table.Head>Employer Share</Table.Head>
                            <Table.Head>Employee Share</Table.Head>
                            <Table.Head>Effective Date</Table.Head>
                            <Table.Head>Actions</Table.Head>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {brackets.map((bracket) => (
                            <Table.Row key={bracket.id}>
                                <Table.Cell>{bracket.range_min}</Table.Cell>
                                <Table.Cell>{bracket.range_max || 'Above'}</Table.Cell>
                                <Table.Cell className="font-bold">{bracket.monthly_salary_credit}</Table.Cell>
                                <Table.Cell>{bracket.employer_share}</Table.Cell>
                                <Table.Cell>{bracket.employee_share}</Table.Cell>
                                <Table.Cell>{new Date(bracket.effective_date).toLocaleDateString()}</Table.Cell>
                                <Table.Cell className="space-x-2">
                                    <Button size="sm" variant="outline" onClick={() => { setEditingBracket(bracket); setIsModalOpen(true); }}>
                                        Edit
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(bracket.id)}>
                                        Deactivate
                                    </Button>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            )}

            {/* Modal for Add/Edit - You would create a form here based on your DB columns */}
            {isModalOpen && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBracket ? "Edit Bracket" : "Add Bracket"}>
                    <form onSubmit={(e) => { e.preventDefault(); handleSave(new FormData(e.target)); }}>
                        {/* Inputs for range_min, range_max, monthly_salary_credit, etc. */}
                        <div className="flex justify-end space-x-2 mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default SSSBracketManager;