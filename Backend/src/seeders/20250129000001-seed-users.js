'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        const salt = await bcrypt.genSalt(10);

        await queryInterface.bulkInsert('Users', [{
            FullName: 'System Administrator',
            Email: 'admin@warehouse',
            Password: await bcrypt.hash('chase@wms', salt),
            userRole: 'admin',
            isActive: true
        }], {});
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('Users', { Email: 'admin@warehouse' }, {});
    }
};