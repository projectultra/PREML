import io
import astropy.io.fits as afits
from .utils import uid
from .hook import Hook
from .typecheck import TypeCheck


def hdu2buf(hdu):
    hdul = afits.HDUList([afits.PrimaryHDU(), hdu])
    buf = io.BytesIO()
    hdul.writeto(buf)
    return buf


class FitsImage:
    '''
    Represents a FITS image.
    '''

    def __init__(self, window, hdu, name):
        '''
        Note:
            Use :attr:`~hscmap.window.Window.fits_images` to make a new FITS image
            instead of using the constructor.
        '''
        self.hook = Hook()
        self._window = window
        self._name = name
        self._id = uid()
        self._tone = None
        self._tone_window = False
        self._buf = hdu2buf(hdu)
        self._on_change_cb = \
            self._window._callback.new(self._on_change, persistent=True)
        self._send()

    def _send(self):
        self._window._channel.send({
            'type': 'add_fits',
            'args': {
                'id': self._id,
                'buf': self._buf.getvalue(),
                'name': self._name,
                'tone': self._tone,
                'on_change': self._on_change_cb.api,
            },
        })

    def remove(self):
        '''
        Removes this FITS image.
        '''
        self.hook.call('remove')
        self._on_change_cb.remove()
        self._window._channel.send({
            'type': 'remove_fits',
            'args': {
                'id': self._id,
            }
        })

    @property
    def name(self):
        '''
        Name of this FITS image. Can be set and read. Its type must be ``str``
        '''
        return self._name

    @name.setter
    def name(self, name):
        TypeCheck(str)(name)
        self._name = name
        self._update()

    @property
    def tone_window(self):
        '''
        Tone window flag, a boolean value. Can be set and read.
        If this flag is set to ``True``, the tone window will be shown.
        
        Example: ::

            img = w.fits_images.from_hdu(hdu)
            img.tone_window = True
        '''
        return self._tone_window

    @tone_window.setter
    def tone_window(self, tone_window):
        self._tone_window = tone_window
        self._update()

    def _update(self):
        self._window._channel.send({
            'type': 'update_fits',
            'args': {
                'id': self._id,
                'name': self._name,
                'tone': self._tone,
                'tone_window': self._tone_window,
            },
        })

    def _restore(self):
        self._send()

    def _on_change(self, attrs):
        self._name = attrs['name']
        self._tone = attrs['tone']
        self._tone_window = attrs['tone_window']


class FitsImageManager:
    '''
    Manages FITS images that belongs to a hscmap window.

    See Also:
        :attr:`~hscmap.window.Window.fits_images`
    '''

    def __init__(self, window):
        self._window = window
        self._members = {}
        self._window.hook.on('restore', self._on_window_restore)

    def from_hdu(self, hdu, *, name=None):
        '''
        Loads FITS image onto a hscMap window.

        Args:
            hdu (astropy.io.fits.ImageHDU): Source image HDU
            name (str): Name for the new image

        Returns:
            :class:`~FitsImage`
        '''
        name = name or f'image-{len(self.members) + 1}'
        fits_image = FitsImage(self._window, hdu, name)
        self._members[fits_image._id] = fits_image

        def on_remove():
            self._members.pop(fits_image._id, None)

        fits_image.hook.on('remove', on_remove)
        return fits_image

    def clear(self):
        '''
        Clears all FITS images on the window.
        '''
        for fi in list(self._members.values()):
            fi.remove()

    def _on_window_restore(self):
        for fi in self._members.values():
            fi._restore()

    @property
    def members(self):
        '''
        All FITS images on the window.

        Returns:
            List of :class:`~hscmap.fitsimage.FitsImage`
        '''
        return list(self._members.values())
