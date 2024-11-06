const { User } = require("./models");

const isSeller = async (req, res, next) => {
	const userId = req.body.userId;

	try {
		const user = await User.findByPk(userId);

		if (!user || !user.isSeller) {
			return res.status(403).json({
				success: false,
				message:
					"Only sellers are allowed to create or manage products",
			});
		}

		next();
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Error verifying user",
			error: error.message,
		});
	}
};

module.exports = { isSeller };
