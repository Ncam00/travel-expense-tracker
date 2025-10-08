export const EXPENSE_CATEGORIES = [
	{
		id: 'food',
		label: 'Food & Dining',
		icon: '🍽️',
		color: 'bg-red-200',
		description: 'Restaurants, groceries, snacks',
	},
	{
		id: 'accommodation',
		label: 'Accommodation',
		icon: '🏨',
		color: 'bg-blue-200',
		description: 'Hotels, hostels, rentals',
	},
	{
		id: 'transport',
		label: 'Transportation',
		icon: '🚗',
		color: 'bg-green-200',
		description: 'Flights, taxis, public transit',
	},
	{
		id: 'activities',
		label: 'Activities',
		icon: '🎯',
		color: 'bg-yellow-200',
		description: 'Tours, attractions, events',
	},
	{
		id: 'shopping',
		label: 'Shopping',
		icon: '🛍️',
		color: 'bg-purple-200',
		description: 'Souvenirs, clothing, gifts',
	},
	{
		id: 'emergency',
		label: 'Emergency',
		icon: '🚨',
		color: 'bg-red-300',
		description: 'Urgent or unexpected expenses',
	},
	{
		id: 'other',
		label: 'Other',
		icon: '📝',
		color: 'bg-gray-200',
		description: 'Miscellaneous expenses',
	},
];

// Helper function to get category by ID
export const getCategoryById = (categoryId) => {
	return (
		EXPENSE_CATEGORIES.find((category) => category.id === categoryId) ||
		EXPENSE_CATEGORIES[6]
	);
};

// Helper function to get category color
export const getCategoryColor = (categoryId) => {
	const category = getCategoryById(categoryId);
	return category.color;
};

// Helper function to get total by category
export const getTotalByCategory = (expenses, categoryId) => {
	return expenses
		.filter((expense) => expense.category === categoryId)
		.reduce((total, expense) => total + Number(expense.amount), 0);
};