import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const GroupContext = createContext();

const GroupProvider = ({ children }) => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/groups/');
            setGroups(response.data);
        } catch (error) {
            console.error('Error fetching groups:', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const addGroup = async (newGroup) => {
        try {
            const response = await api.post('/api/groups/', newGroup, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            setGroups((prevGroups) => [...prevGroups, response.data]);
        } catch (error) {
            console.error('Failed to add group:', error);
            setError(error);
        }
    };

    const contextValue = {
        groups,
        loading,
        error,
        addGroup,
    };

    return (
        <GroupContext.Provider value={contextValue}>
            {children}
        </GroupContext.Provider>
    );
};

export { GroupProvider };