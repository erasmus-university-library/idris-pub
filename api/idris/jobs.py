import requests


def person_bulk_export_job(url):
    # While cursor is not None call request.get(url)
    # Write the results to a file.
    # When done write file.
    res = requests.get(url)
    return res