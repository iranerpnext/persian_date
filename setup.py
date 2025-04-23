from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in frappe_persian_date/__init__.py
from frappe_persian_date import __version__ as version

setup(
	name="persian_date",
	version=version,
	description="Persian date and datepicker",
	author="RBP",
	author_email="info@rbp.ir",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
