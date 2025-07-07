"""Mopidy script to add extension"""

import logging
import pathlib

from mopidy import ext
from mopidy.config import types as config_types

__version__ = "0.1.0"

logger = logging.getLogger(__name__)


class Extension(ext.Extension):
    dist_name = "Mopidy-Soundwave-SPI"
    ext_name = "soundwave-spi"
    version = __version__

    def get_config_schema(self):
        schema = super(Extension, self).get_config_schema()
        schema["spi_bus"] = config_types.Integer()
        schema["spi_device"] = config_types.Integer()
        schema["spi_speed_hz"] = config_types.Integer()
        schema["spi_mode"] = config_types.Integer()

        return schema

    def get_default_config(self):
        config_file = pathlib.Path(__file__).parent / "ext.conf"
        return config_file.read_text(encoding="utf-8")

    def setup(self, registry):
        from .frontend import SoundwaveSPIFrontend

        registry.add("frontend", SoundwaveSPIFrontend)
