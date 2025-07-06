#ifndef SOUNDWAVE_SPI_H
#define SOUNDWAVE_SPI_H

#include "driver/spi_master.h"
#include <stdint.h>

typedef struct {
  spi_device_handle_t handle;
  spi_bus_config_t bus_cfg;
  spi_device_interface_config_t dev_cfg;
} soundwave_spi_config_t;

void soundwave_spi_init(soundwave_spi_config_t *spi_config);
void soundwave_spi_transmit(const soundwave_spi_config_t *spi_config,
                            uint8_t *data, int bytes);

#endif // SOUNDWAVE_SPI_H
