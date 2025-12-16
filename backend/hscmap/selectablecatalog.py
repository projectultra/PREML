# See https://stackoverflow.com/questions/39740632/python-type-hinting-without-cyclic-imports
from __future__ import annotations
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .window import Window


class SelectableCatalog:
    def __init__(self, w: Window, ra, dec, columns, *, name=None, color=None, marker_color=None):
        self._ra = ra
        self._dec = dec
        self._base = w.catalogs.new(ra, dec, columns=columns, name=name, color=color)
        self._marker = w.catalogs.new([], [], name='$marker', color=marker_color or [0, 1, 1, 1])
        self._base.on_click = self._on_click
        self.indices = []
        
    @classmethod
    def from_query_result(cls, w: Window, res, *, name=None, color=None, marker_color=None):
        return cls(w, res.ra, res.dec, name=name, columns=dict(res), color=color, marker_color=marker_color)
        
    def _on_click(self, index: int):
        if index in self.indices:
            self.indices.remove(index)
        else:
            self.indices.append(index)
        self._refresh()
        self.on_change()

    def _refresh(self):
        ra_selected = self._ra[self.indices]
        dec_selected = self._dec[self.indices]
        self._marker.set_coords(ra_selected, dec_selected)

    def remove(self):
        self._base.remove()
        self._marker.remove()

    def on_change(self):
        pass
