from pprint import pformat
from .hook import Hook
from .utils import uid
from .typecheck import TypeCheck, V4


class Polygon:
    def __init__(self, window, paths, *, min_width):
        self._id = uid()
        self._paths = paths
        self._min_width = min_width
        self._window = window
        self.hook = Hook()
        self._send()

    def _send(self):
        self._window._channel.send({
            'type': 'add_polygon',
            'args': {
                'id': self._id,
                'paths': self._paths,
                'min_width': self._min_width,
            }
        })

    def remove(self):
        self._window._channel.send({
            'type': 'remove_polygon',
            'args': {
                'id': self._id,
            }
        })
        self.hook.call('remove')

    # def _update(self, *, name=None, color=None, ra=None, dec=None, columns=None):
    #     self._window._channel.send({
    #         'type': 'update_catalog',
    #         'args': {
    #             'id': self._id,
    #             'name': name,
    #             'color': color,
    #             'ra': ra,
    #             'dec': dec,
    #             'columns': columns,
    #         },
    #     })

    def _restore(self):
        self._send()

    def __repr__(self):
        return f'<Polygon>'


class PolygonManager:
    def __init__(self, window):
        self._window = window
        self._members = {}
        self._window.hook.on('restore', self._on_window_restore)

    def new(self, paths, *, min_width):
        polygon = Polygon(self._window, paths, min_width=min_width)
        self._members[polygon._id] = polygon

        def on_remove():
            self._members.pop(polygon._id, None)

        polygon.hook.on('remove', on_remove)

        return polygon

    def contour_from_fits(self, hdu, *, levels=range(10), alpha=0.5, cmap='jet', min_width=3):
        import matplotlib
        import matplotlib.pyplot
        from astropy import wcs as awcs
        wcs = awcs.WCS(hdu.header)
        data = hdu.data
        contours = matplotlib.pyplot.contour(data,
                                             levels=levels,
                                             extent=(1, data.shape[1], 1, data.shape[0]))
        cmapf = matplotlib.cm.get_cmap(cmap)
        m = min(levels)
        M = max(levels)

        paths = []                                             
        for level, cc in zip(contours.levels, contours.collections):
            color = list(cmapf((level - m) / (M - m)))
            color[3] = alpha
            for section in cc.get_paths():
                pix = [vertex[0] for vertex in section.iter_segments()]
                sky = wcs.wcs_pix2world(pix, 1)
                path = sky2path(sky, color=color)
                paths.append(path)
        polygon = self.new(paths, min_width=min_width)
        return polygon

    def clear(self):
        polygons = list(self._members.values())
        for polygon in polygons:
            polygon.remove()

    @property
    def members(self):
        return list(self._members.values())

    def _on_window_restore(self):
        pass

    def __repr__(self):
        return f'<PolygonManager {pformat(self._members)}>'

def sky2path(sky, color):
    import numpy
    a, d = numpy.deg2rad(sky.T)
    X = numpy.cos(a) * numpy.cos(d)
    Y = numpy.sin(a) * numpy.cos(d)
    Z = numpy.sin(d)
    points = []
    for x, y, z in zip(X, Y, Z):
        point = {
            'position': [x, y, z],
            'color': color,
            'size': 0,
        }
        points.append(point)
    return {
        'points': points,
        'close': False,
        'joint': 0,
    }
