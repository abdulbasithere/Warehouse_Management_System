'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        const salt = await bcrypt.genSalt(10);

        await queryInterface.bulkInsert('Users', [{
            userId: 1, // Added userId to ensure consistency
            fullName: 'System Administrator',
            email: 'basitmalik7775@gmail.com',
            password: await bcrypt.hash('chase@wms', salt),
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }], {});
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('Users', { email: 'basitmalik7775@gmail.com' }, {});
    }
};