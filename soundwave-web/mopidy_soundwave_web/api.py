import logging
import tornado.web

from mopidy import config


class ConfigHandler(tornado.web.RequestHandler):
    def initialize(self, config: config.Proxy):
        self.config = config
        self.logger = logging.getLogger(__name__)

    def get(self):
        soundwave_web_config = self.config.get("soundwave-web")
        self.write(soundwave_web_config or {})
        self.set_header("Content-Type", "application/json")
