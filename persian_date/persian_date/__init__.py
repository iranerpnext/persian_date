import datetime
from persiantools.jdatetime import JalaliDate, JalaliDateTime
from datetime import datetime


def fadate(s: str, default: str = '2024-01-01') -> str:
    date_object = datetime.strptime(s, '%Y-%m-%d').date()
    jdate=JalaliDate(date_object)
    return jdate.strftime("%Y-%m-%d")