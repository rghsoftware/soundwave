"""Mopidy script to add extension"""

import logging
import pathlib

from mopidy import ext

__version__ = "0.1.0"

logger = logging.getLogger(__name__)


class Extension(ext.Extension):
    dist_name = "Mopidy-Soundwave-SPI"
    ext_name = "soundwave-spi"
    version = __version__

    def get_config_schema(self):
        return super(Extension, self).get_config_schema()

    def get_default_config(self):
        config_file = pathlib.Path(__file__).parent / "ext.conf"
        return config_file.read_text(encoding="utf-8")

    def setup(self, registry):
        from .frontend import SoundwaveSPIFrontend

        registry.add("frontend", SoundwaveSPIFrontend)
