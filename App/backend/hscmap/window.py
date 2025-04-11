from .channel import Channel
from .callback import CallbackSet
from .catalog import CatalogManager
from .fitsimage import FitsImageManager
from .polygon import PolygonManager
from .snapshot import Snapshot
from .hook import Hook
from .config import config
from .typecheck import TypeCheck
import math
class Window:
    _instances = set()

    def __init__(self, window_id, title=None):
        self.hook = Hook()
        self._window_id = window_id
        self._title = title or 'HSC Map'
        self._sync_state = {}
        self._callback = CallbackSet(on_error=self._on_callback_error)

        def handle_message(msg):
            msg_type = msg.get('type')
            args = msg.get('args', {})
            if msg_type == 'close':
                self._on_close()
            elif msg_type == 'callback':
                self._callback.call(args['cbid'], args['args'])
            elif msg_type == 'sync_from_frontend':
                self._sync_from_frontend(args)
            else:
                raise RuntimeError(f'unknown message type: {msg_type}')

        self._channel = Channel(window_id, handle_message)
        self.catalogs = CatalogManager(self)
        self.fits_images = FitsImageManager(self)
        self.polygons = PolygonManager(self)
        self.snapshot = Snapshot(self)
        self._instances.add(self)
        self.color_params = ColorParams(self)
        self.rect_selection = RectSelection(self)
        self.fov = FOV(self)

    def close(self):
        self._channel.send({'type': 'close'})

    def _on_close(self):
        self._channel.close()
        self._instances.discard(self)
        self.hook.call('close')

    def jump_to(self, ra, dec, fov):
        args = {'ra': ra, 'dec': dec, 'fov': fov}
        self._channel.send({'type': 'jump_to', 'args': args})

    @property
    def title(self):
        return self._title

    @title.setter
    def title(self, title):
        TypeCheck(str)(title)
        self._title = title
        self._channel.send({'type': 'set_title', 'args': {'title': title}})

    def _sync_from_frontend(self, args):
        for name, value in args.items():
            self._sync_state[name] = value

    def _on_callback_error(self, error):
        self._channel.send({
            'type': 'alert',
            'args': {'message': str(error)},
        })

    def _sync_from_kernel(self, key, value):
        self._channel.send({
            'type': 'sync_from_kernel',
            'args': {key: value},
        })

class ColorParams:
    def __init__(self, w):
        self._w = w

    @property
    def type(self):
        return self._w._sync_state.get('sspParams', {}).get('type', 'SIMPLE_RGB')

    @type.setter
    def type(self, type):
        valid_types = {'SIMPLE_RGB', 'SDSS_TRUE_COLOR'}
        assert type in valid_types, f'type must be one of {valid_types}'
        sspParams = self._w._sync_state.get('sspParams', {})
        sspParams['type'] = type
        self._w._sync_from_kernel('sspParams', sspParams)

class RectSelection:
    def __init__(self, w):
        self._w = w

    def clear(self):
        self._w._sync_from_kernel('rectSelection', None)

    def sql(self):
        area = self.area
        assert area is not None, 'No rectangular selection'
        c0, c1 = area
        return f"boxSearch(coord, {c0['a'] * 180 / math.pi}, {c1['a'] * 180 / math.pi}, {c0['d'] * 180 / math.pi}, {c1['d'] * 180 / math.pi})"

    @property
    def area(self):
        return self._w._sync_state.get('rectSelection')

class FOV:
    def __init__(self, w):
        self._w = w

    def cone_sql(self):
        v = self._w._sync_state.get('view', {})
        return f"coneSearch(coord, {v.get('a', 0) * 180 / math.pi}, {v.get('d', 0) * 180 / math.pi}, {v.get('fovy', 0) * 180 / math.pi * 3600})"