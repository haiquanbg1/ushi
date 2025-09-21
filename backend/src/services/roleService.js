const { Role, User } = require('../models');

class RoleService {
    async getAllRoles() {
        try {
            return await Role.findAll({
                include: [{ model: User, as: 'users' }],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching roles: ${error.message}`);
        }
    }

    async getRoleById(id) {
        try {
            const role = await Role.findByPk(id, {
                include: [{ model: User, as: 'users' }]
            });
            if (!role) {
                throw new Error('Role not found');
            }
            return role;
        } catch (error) {
            throw new Error(`Error fetching role: ${error.message}`);
        }
    }

    async createRole(roleData) {
        try {
            return await Role.create(roleData);
        } catch (error) {
            throw new Error(`Error creating role: ${error.message}`);
        }
    }

    async updateRole(id, updateData) {
        try {
            const [updatedCount] = await Role.update(updateData, {
                where: { id }
            });
            if (updatedCount === 0) {
                throw new Error('Role not found or no changes made');
            }
            return await this.getRoleById(id);
        } catch (error) {
            throw new Error(`Error updating role: ${error.message}`);
        }
    }

    async deleteRole(id) {
        try {
            const deletedCount = await Role.destroy({
                where: { id }
            });
            if (deletedCount === 0) {
                throw new Error('Role not found');
            }
            return { message: 'Role deleted successfully' };
        } catch (error) {
            throw new Error(`Error deleting role: ${error.message}`);
        }
    }

    async getRoleByName(roleName) {
        try {
            return await Role.findOne({
                where: { roleName },
                include: [{ model: User, as: 'users' }]
            });
        } catch (error) {
            throw new Error(`Error fetching role by name: ${error.message}`);
        }
    }
}

module.exports = new RoleService();
