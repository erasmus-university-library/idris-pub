FROM gcr.io/google-appengine/python

# Add idris dependencies

RUN apt-get update && apt-get install -y poppler-utils ghostscript imagemagick

# Create a virtualenv for dependencies. This isolates these packages from
# system-level packages.
RUN virtualenv /env -p python3.6

# Setting these environment variables are the same as running
# source /env/bin/activate.
ENV VIRTUAL_ENV /env
ENV PATH /env/bin:$PATH

# Copy the application's requirements.txt and run pip to install all
# dependencies into the virtualenv.
ADD requirements.txt /app/requirements.txt
RUN pip install -r /app/requirements.txt

# Add the application source code.
ADD . /app

# copy the ImageMagick policy file
COPY ImageMagick-6-policy.xml /etc/ImageMagick-6/policy.xml

# Run a WSGI server to serve the application. gunicorn must be declared as
# a dependency in requirements.txt.
CMD gunicorn -c gunicorn.conf.py --paste idris-gae.ini -b :$PORT
