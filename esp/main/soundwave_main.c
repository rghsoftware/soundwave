#include "soundwave.h"
#include "soundwave_defines.h"

#include <freertos/FreeRTOS.h>

#include <esp_adc/adc_cali.h>
#include <esp_adc/adc_oneshot.h>
#include <esp_log.h>
#include <hal/adc_types.h>
#include <stdint.h>

const static char *TAG = "[SOUNDWAVE][MAIN]";

static bool send_packet = false;
static soundwave_tx_packet_t tx_packet = {.previous = false,
                                          .next = false,
                                          .play_pause = false,
                                          .volume = 101, // 101 means no change
                                          .brightness = 101};

// Used to detect changes in volume and brightness
static int volume_voltage = 0;
static int brightness_voltage = 0;

inline uint8_t soundwave_normalize_adc_voltage(int voltage);

void app_main(void) {
  ESP_LOGI(TAG, "Starting Soundwave application...");
  soundwave_config_t app_cfg = {
      .adc_config =
          {
              .channels = {SOUNDWAVE_ADC_CHAN_1, SOUNDWAVE_ADC_CHAN_2},
          },
      .spi_config = {}};
  soundwave_adc_init(&app_cfg.adc_config);
  ESP_LOGI(TAG, "Initialized Soundwave ADC...");
  soundwave_spi_init(&app_cfg.spi_config);
  ESP_LOGI(TAG, "Initialized Soundwave SPI...");

  while (1) {
    // Read volume from ADC channel 0 and brightness from ADC channel 1
    adc_oneshot_read(app_cfg.adc_config.handle, app_cfg.adc_config.channels[0],
                     &app_cfg.adc_config.raw_data[0]);
    adc_cali_raw_to_voltage(app_cfg.adc_config.cali_handles[0],
                            app_cfg.adc_config.raw_data[0],
                            &app_cfg.adc_config.voltage[0]);
    if (app_cfg.adc_config.voltage[0] != volume_voltage) {
      send_packet = true;
      volume_voltage = app_cfg.adc_config.voltage[0];
      tx_packet.volume = soundwave_normalize_adc_voltage(volume_voltage);
      ESP_LOGI(TAG, "Volume changed: %d", tx_packet.volume);
    } else {
      tx_packet.volume = 101;
    }
    ESP_LOGV(TAG, "Channel 0: Raw: %d, Voltage: %d mV",
             app_cfg.adc_config.raw_data[0], app_cfg.adc_config.voltage[0]);

    adc_oneshot_read(app_cfg.adc_config.handle, app_cfg.adc_config.channels[1],
                     &app_cfg.adc_config.raw_data[1]);
    adc_cali_raw_to_voltage(app_cfg.adc_config.cali_handles[1],
                            app_cfg.adc_config.raw_data[1],
                            &app_cfg.adc_config.voltage[1]);
    if (app_cfg.adc_config.voltage[1] != brightness_voltage) {
      send_packet = true;
      brightness_voltage = app_cfg.adc_config.voltage[1];
      tx_packet.brightness =
          soundwave_normalize_adc_voltage(brightness_voltage);
      ESP_LOGI(TAG, "Brightness changed: %d", tx_packet.brightness);
    } else {
      tx_packet.brightness = 101;
    }

    ESP_LOGV(TAG, "Channel 1: Raw: %d, Voltage: %d mV",
             app_cfg.adc_config.raw_data[1], app_cfg.adc_config.voltage[1]);

    if (send_packet) {
      send_packet = false;
      soundwave_spi_transmit(&app_cfg.spi_config, (uint8_t *)&tx_packet,
                             sizeof(tx_packet));

      // Reset the flags here because the physical buttons reset after being
      // pressed. The volume and brightness values are reset after the ADC
      // reads.
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

inline uint8_t soundwave_normalize_adc_voltage(int voltage) {
  // Normalize the ADC voltage to a range of 0-100
  return (uint8_t)((voltage / SOUNDWAVE_ADC_MAX_VOLTAGE) * 100);
}
