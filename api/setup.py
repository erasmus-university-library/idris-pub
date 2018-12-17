import os
from setuptools import setup, find_packages

VERSION = 0.1

here = os.path.abspath(os.path.dirname(__file__))

try:
    with open(os.path.join(os.path.dirname(here), 'README.rst')) as f:
        README = f.read()
except FileNotFoundError:
    README = 'Idris v%s' % VERSION
with open(os.path.join(here, 'requirements.txt')) as f:
    REQUIREMENTS = f.read().splitlines()


setup(name='idris',
      version=VERSION,
      description='Idris',
      long_description=README,
      classifiers=[
          "Programming Language :: Python",
          "Framework :: Pylons",
          "Topic :: Internet :: WWW/HTTP",
          "Topic :: Internet :: WWW/HTTP :: WSGI :: Application",
          "License :: OSI Approved :: GNU Affero General Public License v3 or later (AGPLv3+)"
      ],
      keywords="web services",
      author='Jasper Op de Coul',
      author_email='jasper.opdecoul@eur.nl',
      url='https://idris.io',
      packages=find_packages(),
      include_package_data=True,
      zip_safe=False,
      install_requires=REQUIREMENTS,
      entry_points="""\
      [paste.app_factory]
      main=idris:main
      [console_scripts]
      idris_admin = idris.scripts:idris_admin
      initialize_db = idris.tools:initialize_db
      drop_db = idris.tools:drop_db
      bigquery_schema = idris.tools:bigquery_schema
      """,
      paster_plugins=['pyramid'])
