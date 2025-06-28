import os

import tornado.web


class ClientRoutingHandler(tornado.web.StaticFileHandler):

    def initialize(self, path):
        self.path = str(path)
        self.absolute_path = path
        self.dirname = path.parent
        self.filename = path.name

        super().initialize(self.dirname)

    def get(self, path=None, include_body=True):
        return super().get(self.path, include_body)
