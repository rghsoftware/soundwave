import logging
from time import sleep

import pykka
import spidev

from mopidy.core.listener import CoreListener
from mopidy.audio.constants import PlaybackState

logger = logging.getLogger(__name__)


class SoundwaveSPIFrontend(pykka.ThreadingActor, CoreListener):
    def __init__(self, config, core):
        super().__init__()
        self.config = config["soundwave-spi"]
        self.core = core

        self.spi = spidev.SpiDev()
        self.spi.open(self.config["spi_bus"], self.config["spi_device"])
        self.spi.max_speed_hz = self.config["spi_speed_hz"]
        self.spi.mode = self.config["spi_mode"]
        self._run = True

    def on_start(self):
        logger.info("SoundwaveSPIFrontend started.")

        while self._run:
            try:
                rx_packet = self.spi.readbytes(5)
                if rx_packet[0]:
                    self.core.playback.previous()
                if rx_packet[1]:
                    self.core.playback.next()
                if rx_packet[2]:
                    playing = self.core.playback.get_playback_state()
                    if playing == PlaybackState.PLAYING:
                        self.core.playback.pause()
                    elif playing == PlaybackState.PAUSED:
                        self.core.playback.resume()
                    else:
                        self.core.playback.play()
                if rx_packet[3]:
                    self.core.playback.set_volume(rx_packet[3])
                if rx_packet[4]:
                    logger.info("Brightness set to %d%%", rx_packet[4])
            except IOError as e:
                logger.error("SPI read error: %s", e)
                sleep(0.1)

    def on_stop(self):
        self._run = False
        self.spi.close()
        logger.info("SoundwaveSPIFrontend stopped.")
