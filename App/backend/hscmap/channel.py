from .utils import as_json, uid

class Channel:
    def __init__(self, window_id, handlers):
        self._window_id = window_id
        self._id = uid()
        self._send_queue = []
        self._handlers = handlers
        self._log = []
        self._ready = True  # Assume Flask is always ready

    def send(self, msg):
        self._add_to_log(msg)
        if self.ready:
            # Instead of Comm, store messages or trigger handlers directly
            self._handlers(msg)
        else:
            self._send_queue.append(msg)

    def _flush_queue(self):
        while len(self._send_queue) > 0:
            msg = self._send_queue.pop(0)
            self._handlers(msg)

    def close(self):
        self._ready = False

    def _add_to_log(self, *args):
        MAX_LEN = 1000
        self._log.append(args)
        while len(self._log) > MAX_LEN:
            self._log.pop(0)

    @property
    def ready(self):
        return self._ready

    @property
    def log(self):
        return self._log