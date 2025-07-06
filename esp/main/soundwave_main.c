#include "soundwave.h"
#include "soundwave_defines.h"

#include <freertos/FreeRTOS.h>

#include <esp_adc/adc_cali.h>
#include <esp_adc/adc_oneshot.h>
#include <esp_log.h>
#include <hal/adc_types.h>

const static char *TAG = "[SOUNDWAVE][MAIN]";

static bool send_packet = false;
static soundwave_tx_packet_t tx_packet = {.previous = false,
                                          .next = false,
                                          .play_pause = false,
                                          .volume = 0,
                                          .brightness = 0};

void app_main(void) {
  ESP_LOGI(TAG, "Starting Soundwave application...");
  soundwave_config_t soundwave_config = {
      .adc_config =
          {
              .channels = {SOUNDWAVE_ADC_CHAN_1, SOUNDWAVE_ADC_CHAN_2},
          },
      .spi_config = {}};
  soundwave_adc_init(&soundwave_config.adc_config);
  ESP_LOGI(TAG, "Initialized Soundwave ADC...");
  soundwave_spi_init(&soundwave_config.spi_config);
  ESP_LOGI(TAG, "Initialized Soundwave SPI...");

  while (1) {
    adc_oneshot_read(soundwave_config.adc_config.handle,
                     soundwave_config.adc_config.channels[0],
                     &soundwave_config.adc_config.raw_data[0]);
    adc_cali_raw_to_voltage(soundwave_config.adc_config.cali_handles[0],
                            soundwave_config.adc_config.raw_data[0],
                            &soundwave_config.adc_config.voltage[0]);
    if (soundwave_config.adc_config.voltage[0] != tx_packet.volume) {
      send_packet = true;
      tx_packet.volume = soundwave_config.adc_config.voltage[0];
      ESP_LOGI(TAG, "Volume changed: %d mV",
               soundwave_config.adc_config.voltage[0]);
    }
    ESP_LOGV(TAG, "Channel 0: Raw: %d, Voltage: %d mV",
             soundwave_config.adc_config.raw_data[0],
             soundwave_config.adc_config.voltage[0]);

    adc_oneshot_read(soundwave_config.adc_config.handle,
                     soundwave_config.adc_config.channels[1],
                     &soundwave_config.adc_config.raw_data[1]);
    adc_cali_raw_to_voltage(soundwave_config.adc_config.cali_handles[1],
                            soundwave_config.adc_config.raw_data[1],
                            &soundwave_config.adc_config.voltage[1]);
    if (soundwave_config.adc_config.voltage[1] != tx_packet.brightness) {
      send_packet = true;
      tx_packet.brightness = soundwave_config.adc_config.voltage[1];
      ESP_LOGI(TAG, "Brightness changed: %d mV",
               soundwave_config.adc_config.voltage[1]);
    }

    ESP_LOGV(TAG, "Channel 1: Raw: %d, Voltage: %d mV",
             soundwave_config.adc_config.raw_data[1],
             soundwave_config.adc_config.voltage[1]);

    if (send_packet) {
      send_packet = false;
      soundwave_spi_transmit(&soundwave_config.spi_config,
                             (uint8_t *)&tx_packet, sizeof(tx_packet));

      // Reset only the flags because the physical buttons reset after being
      // pressed
      tx_packet.previous = false;
      tx_packet.next = false;
      tx_packet.play_pause = false;

      ESP_LOGI(TAG,
               "Sending packet: Previous: %d, Next: %d, Play/Pause: %d, "
               "Volume: %d, Brightness: %d",
               tx_packet.previous, tx_packet.next, tx_packet.play_pause,
               tx_packet.volume, tx_packet.brightness);
    }

    vTaskDelay(1000 / portTICK_PERIOD_MS); // Delay for 1 second
  }
}
