import multiprocessing

workers = 1#multiprocessing.cpu_count() * 2 + 2
forwarded_allow_ips = '*'
secure_scheme_headers = {'X-Forwarded-Proto': 'https'}
max_requests = 1024
max_requests_jitter = 256
timeout = 60
