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
    'ts-<YYYY-MM-DD>' = total downloads sum of last 30 days
    'us-<YYYY-MM-DD>' = total unique user downloads sum of last 30 days

    To retrieve the downloads on a specific day, retrieve the ts-<date> key.
    If None is returned, re-calculate the sum for that day, based on the 't-<date>'
    keys of the last 30 days

    If a download is recorded increment the 't-<today>' field and the ts-<today> field
    Similar to above, re-calculate the sum for that day if the ts-<today> key returns
    None

    Then, clean up all keys that are older then 30 days,

    """
    def __init__(self, uri, prefix, timezone='utc'):
        host, port = uri.replace('redis://', '').split(':')
        self._client = redis.Redis(host=host, port=port)
        self._prefix = '%s:dc' % prefix
        self.today = datetime.datetime.utcnow()

    def _update(self, key, when):
        history = self._client.hgetall(key)
        if history is None:
            self._client.hset(key, 'ts-%s' % when.strftime('%Y-%m-%d'), 0)
            return 0
        min_date = (when - datetime.timedelta(days=30)).strftime('%Y-%m-%d')
        keys_to_delete = []
        total = 0
        for raw_hkey in list(history.keys()):
            hkey = raw_hkey.decode('utf8')
            if hkey.startswith('ts-') or hkey.startswith('us-'):
                keys_to_delete.append(raw_hkey)
                continue
            key_date = hkey.split('-', 1)[1]
            if key_date <= min_date:
                keys_to_delete.append(raw_hkey)
                continue
            total += int(history[raw_hkey])
        if keys_to_delete:
            self._client.hdel(key, *keys_to_delete)
        self._client.hincrby(key, 'ts-%s' % when.strftime('%Y-%m-%d'), total)
        return total

    def history(self, expression_id):
        base_key = '%s:%s' % (self._prefix, expression_id)
        history = {}
        for key, value in self._client.hgetall(base_key).items():
            history[key.decode('utf8')] = int(value)
        return history

    def get_count(self, expression_id, when=None):
        when = when or self.today
        key = '%s:%s' % (self._prefix, expression_id)
        count = self._client.hget(key, 'ts-%s' % when.strftime('%Y-%m-%d'))
        if count is None:
            count = self._update(key, when)
        return int(count)

    def count(self, expression_id, identifier, when=None):
        when = when or self.today
        key = '%s:%s' % (self._prefix, expression_id)
        download_time = when.strftime('%Y-%m-%d')
        count = self._client.hincrby(key, 't-%s' % download_time, 1)
        if count == 1:
            # first download today! update history
            self._update(key, when)
        else:
            self._client.hincrby(key, 'ts-%s' % download_time, 1)
        return count

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
