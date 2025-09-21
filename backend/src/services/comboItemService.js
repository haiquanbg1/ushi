const { ComboItem, Combo, MenuItem } = require('../models');

class ComboItemService {
	async getAllComboItems() {
		try {
			return await ComboItem.findAll({
				include: [
					{ model: Combo, as: 'combo' },
					{ model: MenuItem, as: 'menuItem' }
				]
			});
		} catch (error) {
			throw new Error(`Error fetching combo items: ${error.message}`);
		}
	}

	async getComboItemById(id) {
		try {
			const comboItem = await ComboItem.findByPk(id, {
				include: [
					{ model: Combo, as: 'combo' },
					{ model: MenuItem, as: 'menuItem' }
				]
			});
			if (!comboItem) {
				throw new Error('Combo item not found');
			}
			return comboItem;
		} catch (error) {
			throw new Error(`Error fetching combo item: ${error.message}`);
		}
	}

	async createComboItem(comboItemData) {
		try {
			return await ComboItem.create(comboItemData);
		} catch (error) {
			throw new Error(`Error creating combo item: ${error.message}`);
		}
	}

	async updateComboItem(id, updateData) {
		try {
			const [updatedCount] = await ComboItem.update(updateData, {
				where: { id }
			});
			if (updatedCount === 0) {
				throw new Error('Combo item not found or no changes made');
			}
			return await this.getComboItemById(id);
		} catch (error) {
			throw new Error(`Error updating combo item: ${error.message}`);
		}
	}

	async deleteComboItem(id) {
		try {
			const deletedCount = await ComboItem.destroy({
				where: { id }
			});
			if (deletedCount === 0) {
				throw new Error('Combo item not found');
			}
			return { message: 'Combo item deleted successfully' };
		} catch (error) {
			throw new Error(`Error deleting combo item: ${error.message}`);
		}
	}

	async getComboItemsByComboId(comboId) {
		try {
			return await ComboItem.findAll({
				where: { comboId },
				include: [{ model: MenuItem, as: 'menuItem' }]
			});
		} catch (error) {
			throw new Error(`Error fetching combo items by combo ID: ${error.message}`);
		}
	}
}

module.exports = new ComboItemService();
