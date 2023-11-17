const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const bcrypt = require("bcrypt");

const AgencyUserAccountInfo = new Schema({
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    personal_linkedin_url: {
        type: String
    },
    personal_email: {
        type: String
    },
    extension: {
        type: String
    },
    personal_phone: {
        type: String
    },
    personal_linkedin_url: {
        type: String
    },
    recruiter_image: {
        type: String
    },
    agency_location: {
        type: String
    }
})

const RecruitingSummarySchema = new Schema({
    no_of_exp_as_agency: {
        type: String
    },
    recruitment_service_offering: {
        type: String
    },
    relevant_employment_history: {
        type: String
    }
})

const ExpertiseInSchema = new Schema({
    candidate_roles: [
        {
            type: ObjectId,
            ref: "roles"
        }
    ],
    company_industries: [
        {
            type: ObjectId,
            ref: "industries"
        }
    ],

    candidate_Role:{
        type:Array
    },
    comp_industry:{
        type:Array
    }
})

const CandidateSenioritySchema = new Schema({
    candidate_seniority: {
        type: Array
    },
    more_info: {
        type: String
    },
    type_of_candidate_want_to_recruit: {
        type: String
    }
})

const AgencySchema = new Schema(
	{
        name: {
            type: String
        },
		corporate_email: {
			type: String,
			required: true,
			lowercase: true,
			unique: true,
			trim: true,
			validate(value) {
				const pattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z-.]+$/g;
				if (!pattern.test(value)) {s
					throw new Error("Wrong email format.");
				}
			},
		},
		password: {
			type: String,
			required: true,
			trim: true,
		},
        agency_estd_year: {
            type: String
        },
		website: {
            type: String
        },
        gst_file: {
            type: String
        },
        gst: {
            type: String
        },
		otp: {
			type: String,
			default: 1234,
			trim: true,
		},
        agency_account_info: {
            type: AgencyUserAccountInfo
        },
        recruiting_summary: {
            type: RecruitingSummarySchema
        },
        expertise_in: {
            type: ExpertiseInSchema
        },
        expiration_date: {
            type: Date
        },
        candidate_seniority: {
            type: CandidateSenioritySchema
        },
        is_approved: {
            type: Boolean,
            default: false
        },
         /**
         * 1: Super/Main Agency
         * 2: Sub Agency
         */
        type: {
            type: String,
            required: true,
            enum: [1, 2]
        },
        is_welcome: {
            type: Boolean,
            default: false
        },
        verified: {
            type: Boolean,
            default: false
        }
	},
	{ timestamps: true }
);

AgencySchema.pre("save", async function (next) {
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

AgencySchema.pre("findOneAndUpdate", async function (next) {
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

AgencySchema.methods.isValidPassword = async function (password) {
	try {
		return await bcrypt.compare(password, this.password);
	} catch (error) {
		throw error;
	}
};

const Agency = mongoose.model("agencies", AgencySchema);
module.exports = Agency;
