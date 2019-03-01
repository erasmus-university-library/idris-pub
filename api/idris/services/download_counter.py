import datetime

from zope.interface import implementer
import redis

from idris.interfaces import IDownloadCounter

@implementer(IDownloadCounter)
class RedisDownloadCounter(object):
    """
    For each expression_id, there can be the following key:

    <prefix>:dc:<expression_id>

    which is a hash, that can contain the following keys:

    't-<YYYY-MM-DD>' = total downloads on a date
    'u-<YYYY-MM-DD>' = total unique user downloads on a date
    'ts' = total downloads sum of last 30 days
    'us' = total unique user downloads sum of last 30 days

    To retrieve the downloads on a specific day, retrieve the ts-<date> key.
    If None is returned, re-calculate the sum for that day, based on the 't-<date>'
    keys of the last 30 days

    If a download is recorded increment the 't-<today>' field and the ts field
    Similar to above, re-calculate the sum for that day if the t key returns
    None

    Then, clean up all keys that are older then 30 days,

    Unique users are calculated by adding the identity to a HLL and observing if
    it incremented. These HLL entries are global per repository, and use the following
    key:

    <prefix>:dc:hll-<YYYY-MM-DD>

    Every day all HLLs from the last 30 days are merged into a single HLL stored at:

    <prefix>:dc:hll

    Last all downloads per repository are calculated using the above mechanism, but
    instead of using an integer expression_id, the id 'repo' is used, so:

    <prefix>dc:repo

    Will hold the repository historic counts

    """

    def __init__(self, uri, prefix, timezone='utc'):
        host, port = uri.replace('redis://', '').split(':')
        self._client = redis.Redis(host=host, port=port)
        self._prefix = '%s:dc' % prefix
        self.today = datetime.datetime.utcnow()

    def _update(self, key, when):
        history = self._client.hgetall(key)
        min_date = (when - datetime.timedelta(days=30)).strftime('%Y-%m-%d')
        keys_to_delete = []
        total = 0
        u_total = 0
        for raw_hkey in list(history.keys()):
            hkey = raw_hkey.decode('utf8')
            if hkey == 'ts' or hkey == 'us':
                continue
            if hkey.startswith('ts-') or hkey.startswith('us-'):
                keys_to_delete.append(raw_hkey)
                continue
            key_date = hkey.split('-', 1)[1]
            if key_date <= min_date:
                keys_to_delete.append(raw_hkey)
                continue
            if hkey.startswith('t-'):
                total += int(history[raw_hkey])
            elif hkey.startswith('u-'):
                u_total += int(history[raw_hkey])
        pipe = self._client.pipeline()
        if keys_to_delete:
            pipe.hdel(key, *keys_to_delete)
        pipe.hset(key, 'ts', total)
        pipe.hset(key, 'us', u_total)
        pipe.expire(key, 86400 * 31)
        pipe.execute()
        return total, u_total

    def _update_hll(self, key, when):
        hll_keys = []
        for day in range(30):
            key_date = (when - datetime.timedelta(days=day)).strftime('%Y-%m-%d')
            hll_keys.append('%s:hll-%s' % (self._prefix, key_date))
        total_key = '%s:hll' % self._prefix
        pipe = self._client.pipeline()
        pipe.delete(total_key)
        pipe.pfmerge(total_key, *hll_keys)
        pipe.execute()

    def history(self, expression_id):
        base_key = '%s:%s' % (self._prefix, expression_id)
        history = {}
        for key, value in self._client.hgetall(base_key).items():
            history[key.decode('utf8')] = int(value)
        return history

    def get_total_counts(self, expression_ids, when=None):
        when = when or self.today
        pipe = self._client.pipeline()
        for expression_id in expression_ids:
            key = '%s:%s' % (self._prefix, expression_id)
            pipe.hget(key, 'ts')
        return [int(count or 0) for count in  pipe.execute()]

    def get_unique_counts(self, expression_ids, when=None):
        when = when or self.today
        pipe = self._client.pipeline()
        for expression_id in expression_ids:
            key = '%s:%s' % (self._prefix, expression_id)
            pipe.hget(key, 'us')
        return [int(count or 0) for count in  pipe.execute()]

    def count(self, expression_id, user_identifier, when=None):
        when = when or self.today
        download_time = when.strftime('%Y-%m-%d')
        key = '%s:%s' % (self._prefix, expression_id)
        hll_key = '%s:hll-%s' % (self._prefix, download_time)
        hll_value = '%s:%s' % (expression_id, user_identifier)
        t_count = self._client.hincrby(key, 't-%s' % download_time, 1)
        u_count = 0

        if t_count == 1:
            # first download today! update history
            self._client.expire(key, 86400 * 31) # 31 days
            self._update(key, when)
            self._update_hll(key, when)
        else:
            self._client.hincrby(key, 'ts', 1)

        if self._client.pfadd(
                '%s:hll' % self._prefix, hll_value) == 1:
            # this user has not downloaded the file in the last 30 days
            u_count = self._client.hincrby(key, 'u-%s' % download_time, 1)
            pipe = self._client.pipeline()
            pipe.pfadd(hll_key, hll_value)
            if u_count == 1:
                # first unique download of today!
                pipe.expire(hll_key, 86400 * 31) # 31 days

            pipe.hincrby(key, 'us', 1)
            pipe.execute()
        if expression_id != 'repo':
            # increment the global repository count
            # by calling ourself with 'repo' as expression_id
            self.count('repo', user_identifier, when=when)
        return t_count, u_count

    def flush(self):
        key = '%s:*' % self._prefix
        cursor = '0'
        count = 0
        while cursor is not 0:
            cursor, keys = self._client.scan(
                cursor=cursor, match=key, count=1000)
            if keys:
                count += len(keys)
                self._client.delete(*keys)
        return count

def download_counter_factory(registry, repository_namespace):
    config_url = registry.settings['cache.url']
    proto = config_url.split('://')[0]
    CounterImpl = registry.queryUtility(IDownloadCounter, proto)
    prefix = '%s-%s' % (registry.settings['idris.app_prefix'],
                        repository_namespace)
    return CounterImpl(config_url, prefix)

def includeme(config):
    config.registry.registerUtility(
        RedisDownloadCounter, IDownloadCounter, 'redis')
