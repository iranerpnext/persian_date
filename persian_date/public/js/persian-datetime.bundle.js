import persianDate from "persian-date";
import jmoment from 'jalali-moment/dist/jalali-moment';

frappe.ui.form.ControlDatetime = class CustomControlDatetime extends frappe.ui.form.ControlDate {
    set_formatted_input(value) {
        if (this.timepicker_only) return;
        if (!this.datepicker) return;
        if (!value) {
            // Commented out because the datepicker does not have a clear method
            // this.datepicker.clearDate();
            return;
        } else if (value.toLowerCase() === "today") {
            value = this.get_now_date();
        } else if (value.toLowerCase() === "now") {
            value = frappe.datetime.now_datetime();
        }
        value = this.format_for_input(value);
        this.$input && this.$input.val(value);

        // Ensure datepicker is updated correctly
        if (value) {
            let dateObj = frappe.datetime.user_to_obj(value);
            this.datepicker.setDate(dateObj);
        }
    }

    get_start_date() {
        this.value = this.value == null || this.value == "" ? undefined : this.value;
        let value = frappe.datetime.convert_to_user_tz(this.value);
        return frappe.datetime.str_to_obj(value);
    }

    set_date_options() {
        super.set_date_options();
        this.today_text = __("Now");
        this.date_format = frappe.defaultDatetimeFormat;

        $.extend(this.datepicker_options, {
            timePicker: {
                enabled: true,
                meridiem: {
                    enabled: false
                }
            },
            calendar: {
                persian: {
                    leapYearMode: 'astronomical'
                },
                gregorian: {
                    locale: 'en'
                }
            },
            format: this.date_format,
            formatter: (unixDate) => {
                persianDate.toLocale('en');
                const formattedDate = (new persianDate(unixDate)).format(this.date_format);
                return formattedDate;
            },
            onSelect: (unix) => {
                this.selectedDate = new Date(unix);
            }
        });
    }

    get_now_date() {
        return frappe.datetime.now_datetime(true);
    }

    parse(value) {
        if (value) {
            value = frappe.datetime.user_to_str(value, false);
            if (!frappe.datetime.is_system_time_zone()) {
                value = frappe.datetime.convert_to_system_tz(value, true);
            }
            if (value === "Invalid date") {
                value = "";
            }
        }
        return value;
    }

    format_for_input(value) {
        if (!value) return "";
        return frappe.datetime.str_to_user(value, false);
    }

    set_description() {
        const description = this.df.description;
        const time_zone = this.get_user_time_zone();
        if (!this.df.hide_timezone) {
            if (!description) {
                this.df.description = time_zone;
            } else if (!description.includes(time_zone)) {
                this.df.description += "<br>" + time_zone;
            }
        }
        super.set_description();
    }

    get_user_time_zone() {
        return frappe.boot.time_zone ? frappe.boot.time_zone.user : frappe.sys_defaults.time_zone;
    }

    set_datepicker() {
        super.set_datepicker();
        if (this.datepicker) {
            const $tp = this.datepicker.timepicker;
            if ($tp) {
                // Ensure that seconds and minutes are correctly handled
                $tp.$minutes.val($tp.minutes || 0);
                $tp.$seconds.val($tp.seconds || 0);
            }
        }
    }

    get_model_value() {
        let value = super.get_model_value();
        if (!value && !this.doc) {
            value = this.last_value;
        }
        return !value ? "" : frappe.datetime.get_datetime_as_string(value);
    }
};


frappe.form.formatters.Datetime = function (value) {
		if (value) {
            // value = frappe.datetime.convert_to_user_tz(value);
            let sysdefaults = frappe.sys_defaults;
            let date_format = sysdefaults && sysdefaults.date_format ? sysdefaults.date_format : "yyyy-mm-dd";
            let time_format = sysdefaults && sysdefaults.time_format ? sysdefaults.time_format : "HH:mm:ss"
            try {
                let jdate = jmoment(value);
                value = jdate.locale('fa').format(date_format.toUpperCase() + ' ' + time_format);
            } catch (e) {
                return "";
            }
            if (value === "Invalid date") {
                value = null;
            }
		}
        return value || "";
}
