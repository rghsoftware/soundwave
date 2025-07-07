#ifndef SOUNDWAVE_H
#define SOUNDWAVE_H

#include "soundwave_adc.h"
#include "soundwave_spi.h"
#include <stdint.h>

typedef struct {
  bool previous;
  bool next;
  bool play_pause;
  uint8_t volume;
  uint8_t brightness;
} soundwave_tx_packet_t;

typedef struct {
  soundwave_adc_config_t adc_config;
  soundwave_spi_config_t spi_config;
} soundwave_config_t;

#endif // SOUNDWAVE_H
