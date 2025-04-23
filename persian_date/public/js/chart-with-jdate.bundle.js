import jmoment from 'jalali-moment/dist/jalali-moment';

frappe.widget.widget_factory.chart  = class CustomChartWidget extends frappe.widget.widget_factory.chart  {
    constructor(opts) {
        super(opts);
    }

    // Override the get_chart_args method to format dates
    get_chart_args() {
        const chart_args = super.get_chart_args();

        if (this.chart_doc.timeseries) {
            chart_args.data.labels = chart_args.data.labels.map(label => {
                // Convert Gregorian date to Persian date
                if (label && typeof label === 'string') {
                    if (jmoment(label).isValid())
                        return jmoment(label).format('jYYYY-jMM-jDD');
                    else if (label.startsWith('Quarter'))
                        return convertQuarterLabel(label);
                }
                return label;
            });
        }

        return chart_args;
    }

    // Similarly, override other methods that require date conversion
}

function convertQuarterLabel(input) {
    const quarterStartDates = {
        1: '01-01',
        2: '04-01',
        3: '07-01',
        4: '10-01'
    };

    // Extract the quarter and year from the input
    const [_, quarter, year] = input.match(/Quarter (\d+) (\d{4})/);

    // Get the start date of the specified quarter
    const startDate = quarterStartDates[quarter];

    // Construct the full date string
    const dateStr = `${year}-${startDate}`;

    // Convert the start date of the quarter to Jalali year
    const jalaliYear = jmoment(dateStr, 'YYYY-MM-DD').format('jYYYY');

    // Persian quarter names
    const persianQuarters = {
        1: 'زمستان',
        2: 'بهار',
        3: 'تابستان',
        4: 'پاییز'
    };

    return `${persianQuarters[quarter]} ${jalaliYear}`;
}