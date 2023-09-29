const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const bcrypt = require("bcrypt");

const RecruiterSchema = new Schema(
	{
        agency: {
            type: ObjectId,
            ref: 'agencies'
        },
		employer: {
            type: ObjectId,
            ref: 'employers'
        },
        fname: {
            type: String
        },
        lname: {
            type: String
        },
		email: {
			type: String,
			required: true,
			lowercase: true,
			trim: true,
			validate(value) {
				const pattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z-.]+$/g;
				if (!pattern.test(value)) {
					throw new Error("Wrong email format.");
				}
			},
		},
        phone: {
            type: String
        },
		password: {
			type: String,
			required: true,
			trim: true,
		},
		otp: {
			type: String,
			default: 1234,
			trim: true,
		},
		status: {
			type: Boolean,
			default: true
		},
		invitation_status: {
			type: String,
			enum: {
				values: [0,1,2],
				message: "only 0:(invited)/1:(accepted)/3:(login) allowed."
			},
			default: 0,
			required: true
		},
		accepted_on: {
			type: Date
		},
		token: {
			type: String
		}
	},
	{ timestamps: true }
);

RecruiterSchema.pre("save", async function (next) {
	try {
		if (this.isNew) {
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(this.password, salt);
			this.password = hashedPassword;
		}
		next();
	} catch (error) {
		next(error);
	}
});

RecruiterSchema.pre("findOneAndUpdate", async function (next) {
	try {
		if (this._update.password) {
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(this._update.password, salt);
			this._update.password = hashedPassword;
		}
		next();
	} catch (error) {
		next(error);
	}
});

RecruiterSchema.methods.isValidPassword = async function (password) {
	try {
		return await bcrypt.compare(password, this.password);
	} catch (error) {
		throw error;
	}
};

const Recruiter = mongoose.model("recruiters", RecruiterSchema);
module.exports = Recruiter;
