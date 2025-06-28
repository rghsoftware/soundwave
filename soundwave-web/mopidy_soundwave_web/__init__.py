"""Mopidy script to add extension"""

import logging
import pathlib

import tornado.web

from mopidy import ext

from . import api, routing

__version__ = "0.1.0"

logger = logging.getLogger(__name__)


def soundwave_web_factory(config, _):
    static_directory_path = pathlib.Path(__file__).parent / "static"
    logger.debug("Static directory path: %s", static_directory_path)

    return [
        (
            r"/config/?",
            api.ConfigHandler,
            {
                "config": config,
            },
        ),
        (
            r"/((.*)(?:css|js|json|map|svg|png|jpg|ico)$)",
            tornado.web.StaticFileHandler,
            {"path": static_directory_path},
        ),
        (
            r"/(.*)",
            routing.ClientRoutingHandler,
            {"path": static_directory_path / "index.html"},
        ),
    ]


class Extension(ext.Extension):
    dist_name = "Mopidy-Soundwave-Web"
    ext_name = "soundwave-web"
    version = __version__

    def get_config_schema(self):
        return super(Extension, self).get_config_schema()

    def get_default_config(self):
        config_file = pathlib.Path(__file__).parent / "ext.conf"
        return config_file.read_text(encoding="utf-8")

    def setup(self, registry):
        registry.add(
            "http:app", {"name": self.ext_name, "factory": soundwave_web_factory}
        )
        logger.info("Mopidy-Soundwave-Web extension loaded")
