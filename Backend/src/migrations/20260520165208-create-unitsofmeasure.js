'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('UnitsOfMeasure', {
            uoMId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            unitName: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            conversionFactor: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            parentUoMId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'UnitsOfMeasure',
                    key: 'uoMId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            isBaseUnit: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },

        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('UnitsOfMeasure');
    }
};
