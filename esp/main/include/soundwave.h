#ifndef SOUNDWAVE_H
#define SOUNDWAVE_H

#include "soundwave_adc.h"
#include "soundwave_spi.h"

typedef struct {
  bool previous : 1;
  bool next : 1;
  bool play_pause : 1;
  int volume : 12;
  int brightness : 12;
} soundwave_tx_packet_t;

typedef struct {
  soundwave_adc_config_t adc_config;
  soundwave_spi_config_t spi_config;
} soundwave_config_t;

#endif // SOUNDWAVE_H
