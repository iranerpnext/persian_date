import persianDate from 'persian-date/dist/persian-date';
import persianDatepicker from 'persian-datepicker/dist/js/persian-datepicker';
import jmoment from 'jalali-moment/dist/jalali-moment';

window.persianDate = persianDate;


frappe.ui.form.ControlDate = class CustomControlDate extends frappe.ui.form.ControlData {
    static trigger_change_on_input_event = false;

    make_input() {
        super.make_input();
        this.make_picker();
        this.$input.on('keydown', (e) => e.preventDefault()); // prevent changing value of date/datetime inputs with typing
    }
    make_picker() {
        this.set_date_options();
        this.set_datepicker();
    }

    set_formatted_input(value) {
        persianDate.toLocale('en');
        if (value && value.toLowerCase() === "today") {
            value = this.get_now_date();
        }

        super.set_formatted_input(value);
        if (this.timepicker_only) return;
        if (!this.datepicker) return;

        let should_refresh = this.last_value && this.last_value !== value;

        if (!should_refresh) {
            if (this.selectedDate) {
                const selected_date = moment(this.selectedDate).format(
                    this.date_format
                );
                should_refresh = selected_date !== value;
            } else {
                should_refresh = true;
            }
        }

        if (should_refresh) {
            if (value) {
                this.datepicker.setDate(frappe.datetime.str_to_obj(value));
            }
        }
    }

    set_datepicker() {
        persianDate.toLocale('en');
        this.$input.persianDatepicker(this.datepicker_options);
        this.datepicker = this.$input.data("datepicker");
    }

    set_date_options() {
        persianDate.toLocale('en');
        let sysdefaults = frappe.boot.sysdefaults;
        let date_format =
            sysdefaults && sysdefaults.date_format ? sysdefaults.date_format : "yyyy-mm-dd";

        this.today_text = __("Today");
        this.date_format = frappe.defaultDateFormat;

        this.datepicker_options = {
            initialValue: false,
            altField: '#alt-date',
            autoClose: true,
            toolbox: {
                todayButton: {
                    enabled: true,
                    text: {
                        fa: this.today_text,
                        en: this.today_text
                    }
                },
            },
            calendar: {
                persian: {
                    leapYearMode: 'astronomical'
                },
                gregorian: {
                    locale: 'en'
                }
            },
            format: date_format,
            formatter: (unixDate) => {
                persianDate.toLocale('en');
                const formattedDate = (new persianDate(unixDate)).format(this.date_format.toUpperCase());
                return formattedDate;
            },
            minDate: this.df.min_date,
            maxDate: this.df.max_date,
            onSelect: (unix) => {
                this.selectedDate = new Date(unix);
                this.$input.trigger("change");
            }
        };
    }

    parse(value) {
        if (value) {
            if (value === "Invalid date") {
                return "";
            }
            persianDate.toLocale('en');
            value = frappe.datetime.user_to_str(value, false, true);
            persianDate.toCalendar('gregorian');
            value = (new persianDate(this.selectedDate)).format(this.date_format);
        }
        return value;
    }

    format_for_input(value) {
        if (value) {
            persianDate.toCalendar('persian');
            persianDate.toLocale('en');
            let sysdefaults = frappe.sys_defaults;
            let date_format = sysdefaults && sysdefaults.date_format ? sysdefaults.date_format : "yyyy-mm-dd";
            let formattedValue = (new persianDate(new Date(value))).format(date_format.toUpperCase());
            return formattedValue;
        }
        return "";
    }

    get_start_date() {
		return this.get_now_date();
	}

    get_now_date() {
		return frappe.datetime
			.convert_to_system_tz(frappe.datetime.now_date(true), false)
			.toDate();
	}
};

frappe.form.formatters.Date = function (value) {
    if (value) {
        let sysdefaults = frappe.sys_defaults;
        let date_format = sysdefaults && sysdefaults.date_format ? sysdefaults.date_format : "yyyy-mm-dd";
        try {
            let jdate = jmoment(value);
            value = jdate.locale('fa').format(date_format.toUpperCase());
        } catch (e) {
            return "";
        }
        if (value === "Invalid date") {
            value = null;
        }
    }
    return value || "";
};