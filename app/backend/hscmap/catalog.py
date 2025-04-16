import numpy
from pprint import pformat
from .hook import Hook
from .utils import uid
from .typecheck import TypeCheck, V4


class Catalog:
    def __init__(self, window, ra, dec, columns, *, name, color=None):
        '''
        Represents a catalog.

        Note:
            You should use :attr:`hscmap.window.Window.catalogs`
            to create a new :class:`Catalog` instaed of directly using the constructor.

        Args:
            window(:class:`hscmap.window.Window`): Owner window
            ra (ndarray): RA in degrees
            dec (ndarray): DEC in degrees
            columns (dict<str, ndarray> | (str, ndarray)[]): Additional columns
        '''

        if not numpy.all(numpy.isfinite(ra)) or not numpy.all(numpy.isfinite(dec)):
            raise RuntimeError(f'Ra or Dec contains NaN or Inf.')
        color = color or [0, 1, 0, 0.5]
        TypeCheck(V4)(color)
        assert len(ra) == len(dec)
        self._name = name
        self._id = uid()
        self._window = window
        if isinstance(columns, dict):
            columns = list(columns.items())
        self._ra = ra
        self._dec = dec
        self._columns = columns
        self._color = color
        self.hook = Hook()

        def call_on_click(*args):
            self.on_click(*args)

        self._on_click_cb = \
            self._window._callback.new(call_on_click, persistent=True)

        self._on_change_cb = \
            self._window._callback.new(self._on_change, persistent=True)

        self._send()

    def _send(self):
        self._window._channel.send({
            'type': 'add_catalog',
            'args': {
                'id': self._id,
                'ra': self._ra,
                'dec': self._dec,
                'name': self._name,
                'columns': self._columns,
                'color': self._color,
                'on_click': self._on_click_cb.api,
                'on_change': self._on_change_cb.api,
            }
        })

    def remove(self):
        '''
        Removes this catalog.
        '''
        self._on_click_cb.remove()
        self._on_change_cb.remove()
        self._window._channel.send({
            'type': 'remove_catalog',
            'args': {
                'id': self._id,
            }
        })
        self.hook.call('remove')

    @property
    def name(self):
        '''
        Name of this catalog. Can be set and read.
        '''
        return self._name

    @name.setter
    def name(self, name):
        TypeCheck(str)(name)
        self._name = name
        self._update(name=name)

    @property
    def color(self):
        '''
        Color of markers. Can be set and read. It's type should be ``[float, float, float, float]``.
        '''
        return self._color

    @color.setter
    def color(self, color):
        TypeCheck(V4)(color)
        self._color = color
        self._update(color=color)

    def set_coords(self, ra, dec, columns=[]):
        '''
        Updates its objects' coordinates and columns.
        Types of arameters are the same as :class:`~hscmap.catalog.Catalog`.
        '''
        assert len(ra) == len(dec)
        if isinstance(columns, dict):
            columns = list(columns.items())
        self._ra = ra
        self._dec = dec
        self._column = columns
        self._update(ra=ra, dec=dec, columns=columns)

    def _update(self, *, name=None, color=None, ra=None, dec=None, columns=None):
        self._window._channel.send({
            'type': 'update_catalog',
            'args': {
                'id': self._id,
                'name': name,
                'color': color,
                'ra': ra,
                'dec': dec,
                'columns': columns,
            },
        })

    def _on_change(self, attrs):
        self._name = attrs['name']
        self._color = attrs['color']

    def on_click(self, index):
        '''
        Callback for clicking objects of this catalog.
        This method can be overwritten by user.
        It accepts an index of clicked object.

        Example: ::
        
            res = sql.query('SELECT ...')

            catalog = w.catalogs.from_query_result(res)

            indices = []
            def on_click(index):
                indices.append(index)
            
            catalog.on_click = on_click
        '''
        pass

    def _restore(self):
        self._send()

    def __repr__(self):
        return f'<Catalog name={self._name} len={len(self._ra)}>'


class CatalogManager:
    '''
    Manages catalogs that belongs to a hscmap window.
    
    See Also:
        :attr:`~hscmap.window.Window.catalogs`
    '''
    def __init__(self, window):
        self._window = window
        self._members = {}
        self._window.hook.on('restore', self._on_window_restore)

    def new(self, ra, dec, *, name=None, columns=[], color=None):
        '''
        Makes new catalog.

        Args:    
            ra (ndarray): RA in degrees
            dec (ndarray): Dec in degrees
            columns (dict<str, ndarray> | (str, ndarray)[]): Additional columns
            name (str): catalog name
            color ([float, float, float, float]): marker color

        Returns:
            :class:`~hscmap.catalog.Catalog`
        
        Example: ::

            n = 100
            a = numpy.random.uniform(150, 151, n)
            d = numpy.random.uniform(1, 2, n)

            w.jump_to(a[0], d[0], 1)
            random_catalog = w.catalogs.new(a, d)

        See Also:
            :attr:`hscmap.window.Window.catalogs`
        '''
        if name is None:
            name = f'catalog-{len(self._members) + 1}'
        cat = Catalog(self._window, ra, dec, columns, name=name, color=color)
        self._members[cat._id] = cat

        def on_remove():
            self._members.pop(cat._id, None)

        cat.hook.on('remove', on_remove)

        return cat

    def from_query_result(self, res, *, name=None, color=None):
        '''
        Makes new catalog plot from a resutltant object generated by ``hscdata.sql.pandas_read_sql``.

        Args:
            res (pandas.Series): Query result
            name (str): Catalog name
            color ([float, float, float, float]): Marker color

        Returns:
            :class:`~hscmap.catalog.Catalog`

        Example: ::

            import hscdata.sql as sql

            res = sql.pandas_read_sql("""
            SELECT
                object_id
                ,ra
                ,dec
                ,i_cmodel_mag
                ,i_cmodel_magsigma
                ,y_cmodel_mag
                ,y_cmodel_magsigma
            FROM
                pdr2_wide.forced
            WHERE
                boxSearch(coord,
                    151.38831350334513, 151.40458586556656,
                    0.06900732437557724, 0.0825390607736913)
                AND isprimary
            """, isNullColumn=False)

            catalog = w.catalogs.from_query_result(res)
        '''
        return self.new(res.ra, res.dec, name=name, columns=dict(res), color=color)

    def clear(self):
        '''
        Clear all catalogs managed by this object.
        '''
        cats = list(self._members.values())
        for cat in cats:
            cat.remove()

    @property
    def members(self):
        '''
        All catalogs on the window.

        Returns:
            List of :class:`~hscmap.catalog.Catalog`
        '''
        return list(self._members.values())

    def _on_window_restore(self):
        for cat in self._members.values():
            cat._restore()

    def __repr__(self):
        return f'<CatalogManager {pformat(self._members)}>'
