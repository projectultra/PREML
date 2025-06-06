
import json
from pathlib import Path

from ._version import __version__
from .config import config
from .window import Window

HERE = Path(__file__).parent.resolve()

with (HERE / "labextension" / "package.json").open() as fid:
    data = json.load(fid)


def _jupyter_labextension_paths():
    return [{
        "src": "labextension",
        "dest": data["name"]
    }]


def _restore():
    Window._restore_instances()
