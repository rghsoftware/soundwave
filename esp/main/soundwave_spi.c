#include "soundwave_spi.h"
#include "soundwave_defines.h"

#include "driver/spi_master.h"
#include "esp_err.h"
#include "esp_log.h"

#include <string.h>

const static char *TAG = "[SOUNDWAVE][SPI]";

void soundwave_spi_init(soundwave_spi_config_t *spi_config) {
  spi_config = malloc(sizeof(soundwave_spi_config_t));
  spi_config->bus_cfg = (spi_bus_config_t){
      .mosi_io_num = SOUNDWAVE_MOSI_PIN,
      .miso_io_num = SOUNDWAVE_MISO_PIN,
      .sclk_io_num = SOUNDWAVE_SCLK_PIN,
      .quadwp_io_num = -1, // Not used
      .quadhd_io_num = -1, // Not used
  };

  spi_config->dev_cfg =
      (spi_device_interface_config_t){.command_bits = 0,
                                      .address_bits = 0,
                                      .dummy_bits = 0,
                                      .clock_speed_hz = 2000000, // 1 MHz
                                      .duty_cycle_pos = 128, // 50% duty cycle
                                      .mode = 0,
                                      .spics_io_num = SOUNDWAVE_CS_PIN,
                                      .queue_size = 3};

  ESP_ERROR_CHECK(spi_bus_initialize(SOUNDWAVE_SPI_HOST, &spi_config->bus_cfg,
                                     SOUNDWAVE_SPI_DMA_CHAN));
  ESP_ERROR_CHECK(spi_bus_add_device(SOUNDWAVE_SPI_HOST, &spi_config->dev_cfg,
                                     &spi_config->handle));
}

void soundwave_spi_transmit(const soundwave_spi_config_t *spi_config,
                            uint8_t *data, int bytes) {
  spi_transaction_t trans;
  esp_err_t ret = ESP_FAIL;

  memset(&trans, 0, sizeof(spi_transaction_t));
  trans.tx_buffer = data;
  trans.length = bytes * 8;
  ret = spi_device_transmit(spi_config->handle, &trans);
  if (ret != ESP_OK) {
    ESP_LOGE(TAG, "transmit error: %s", esp_err_to_name(ret));
  }
}
