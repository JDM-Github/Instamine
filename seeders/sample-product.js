"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert(
			"Products",
			[
				{
					name: "Smartphone X100",
					userId: 1,
					specification:
						"A high-end smartphone with excellent features and performance.",
					category: "Electronics",
					product_image:
						"https://www.techtarget.com/rms/onlineimages/hp_elitebook_mobile.jpg",
					product_images: [
						"https://www.techtarget.com/rms/onlineimages/hp_elitebook_mobile.jpg",
						"https://www.techtarget.com/rms/onlineimages/hp_elitebook_mobile.jpg",
					],
					price: 50,
					number_of_sold: 10,
					number_of_stock: 30,
					active: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					name: "Gaming Laptop Y200",
					userId: 1,
					specification:
						"A powerful laptop designed for gaming enthusiasts.",
					category: "Computers",
					product_image:
						"https://image.made-in-china.com/202f0j00fGwbFAJrElpt/Elitebook640-G10-Silver-I7-1355u-14-FHD-1920X1080-Laptop-Computer-16GB-1tb-SSD-Win11.webp",
					product_images: [
						"https://www.techtarget.com/rms/onlineimages/hp_elitebook_mobile.jpg",
						"https://www.techtarget.com/rms/onlineimages/hp_elitebook_mobile.jpg",
					],
					price: 100,
					number_of_stock: 30,
					number_of_sold: 5,
					active: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{}
		);
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete("Products", null, {});
	},
};
