'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class Organization extends DatabaseFieldset {
	static get fields() {
		return ["okato", "pin_code_prefix", "resource_source", "provides", "has_schedule", "has_unit", "unit_of", "org_timezone", "booking_methods", "live_autopostpone", "live_autorestore", "live_autopostpone_count",
			"prebook_expiration_interval", "prebook_show_interval", "prebook_label_prefix", "prebook_observe_offset", "prebook_register_interval", "error_dialog_duration", "formatted_address", "mkgu_code", "qa_enabled", "frontend_cache"
		];
	}

	static get references() {
		return ["provides", "has_schedule", "has_unit", "unit_of"];
	}
}

module.exports = Organization;
