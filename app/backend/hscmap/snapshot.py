import asyncio
from base64 import b64decode
from IPython.display import display, HTML


class Snapshot:
    '''
    See Also:
        :attr:`~hscmap.window.Window.snapshot`
    '''
    def __init__(self, window):
        self._window = window

    def __call__(self, *, width=None, height=None):
        '''
        Makes a request for snapshot.
        This returns a future object.

        Example:
            ::
            
                fut = w.snapshot()
                # wait few seconds
                fut.result()
        '''
        fut = asyncio.Future()

        def cb(url):
            html = HTML(f'<img src="{url}" />')
            fut.set_result(html)
        assert (width is None) is (height is None), \
            'only width or height is specified'
        self._window._channel.send({
            'type': 'snapshot',
            'args': {
                'callback': self._window._callback.new(cb).api,
                'size': [width, height] if width is not None else None,
            }
        })
        return fut

    def save(self, filename, *, width=None, height=None):
        '''
        Saves snapshot of the window to a file.

        Args:
            filename (str): file to save the image.

        Returns:
            `asyncio.Future`

        Example:
            ::

                fut = w.snapshot.save('a.png')
                !open a.png
        '''
        fut = asyncio.Future()

        def cb(url):
            try:
                header, encoded = url.split(",", 1)
                data = b64decode(encoded)
                with open(filename, 'wb') as f:
                    f.write(data)
                fut.set_result(True)
            except Exception as e:
                fut.set_exception(e)

        assert (width is None) is (height is None), \
            'only width or height is specified'
        self._window._channel.send({
            'type': 'snapshot',
            'args': {
                'callback': self._window._callback.new(cb).api,
                'size': [width, height] if width is not None else None,
            }
        })
        return fut
