from pprint import pformat


class Hook:
    def __init__(self):
        self._hooks = {}

    def on(self, type, cb):
        if type not in self._hooks:
            self._hooks[type] = []
        self._hooks[type].append(cb)

        def off():
            self._hooks[type].remove(cb)

        return off

    def once(self, type, cd):
        off = None

        def cd2(*args):
            off()
            cb(*args)
        off = self.on(type, cb2)

        return off

    def call(self, type, *args):
        if type in self._hooks:
            for cb in self._hooks[type]:
                cb(*args)

    def __repr__(self):
        return f'<Hook {pformat(self._hooks)}>'
