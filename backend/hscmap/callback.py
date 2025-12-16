import traceback
from .utils import uid


class Callback:
    def __init__(self, cbset, cb, persistent):
        self._cbset = cbset
        self.cbid = uid()
        self.cb = cb
        self.persistent = persistent

    @property
    def api(self):
        return {'cbid': self.cbid}

    def remove(self):
        self._cbset.delete(self)


class CallbackSet:
    def __init__(self, *, on_error=None):
        self._log = []
        self._members = {}
        self._on_error = on_error

    def new(self, cb, persistent=False):
        cbc = Callback(self, cb, persistent)
        self._members[cbc.cbid] = cbc
        return cbc

    def call(self, cbid, args):
        self._add_to_log(cbid, *args)
        members = self._members
        if cbid in members:
            cbc = members[cbid]
            if not cbc.persistent:
                members.pop(cbid)
            try:
                cbc.cb(*args)
            except Exception as error:
                error_info = traceback.format_exc()
                if self._on_error:
                    self._on_error(error_info)
                self._add_to_log(cbid, error_info, *args)

    def delete(self, cbc):
        cbid = cbc.cbid
        members = self._members
        if cbid in members:
            members.pop(cbid)

    def _add_to_log(self, *args):
        MAX_LEN = 1000
        self._log.append(args)
        while len(self._log) > MAX_LEN:
            self._log.pop(0)

    @property
    def log(self):
        return self._log
