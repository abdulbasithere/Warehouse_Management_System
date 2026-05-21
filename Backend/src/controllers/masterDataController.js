import { Department, VehicleType } from '../models/setupModels.js';

// Departments
export const getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.findAll({ where: { isActive: true }, order: [['name', 'ASC']] });
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching departments', error: error.message });
    }
};

export const createDepartment = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });
        const dept = await Department.create({ name });
        res.status(201).json(dept);
    } catch (error) {
        res.status(500).json({ message: 'Error creating department', error: error.message });
    }
};

export const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        await Department.update({ isActive: false }, { where: { id } });
        res.json({ message: 'Department deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting department', error: error.message });
    }
};

// Vehicle Types
export const getAllVehicleTypes = async (req, res) => {
    try {
        const types = await VehicleType.findAll({ where: { isActive: true }, order: [['name', 'ASC']] });
        res.json(types);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vehicle types', error: error.message });
    }
};

export const createVehicleType = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });
        const type = await VehicleType.create({ name });
        res.status(201).json(type);
    } catch (error) {
        res.status(500).json({ message: 'Error creating vehicle type', error: error.message });
    }
};

export const deleteVehicleType = async (req, res) => {
    try {
        const { id } = req.params;
        await VehicleType.update({ isActive: false }, { where: { id } });
        res.json({ message: 'Vehicle type deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting vehicle type', error: error.message });
    }
};
