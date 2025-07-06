#include "soundwave.h"
#include "soundwave_defines.h"

#include <freertos/FreeRTOS.h>

#include <esp_adc/adc_cali.h>
#include <esp_adc/adc_oneshot.h>
#include <esp_log.h>
#include <hal/adc_types.h>

const static char *TAG = "[SOUNDWAVE][MAIN]";


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

  while (1) {
    adc_oneshot_read(soundwave_config.adc_config.handle,
                     soundwave_config.adc_config.channels[0],
                     &soundwave_config.adc_config.raw_data[0]);
    adc_cali_raw_to_voltage(soundwave_config.adc_config.cali_handles[0],
                            soundwave_config.adc_config.raw_data[0],
                            &soundwave_config.adc_config.voltage[0]);
    ESP_LOGV(TAG, "Channel 0: Raw: %d, Voltage: %d mV",
             soundwave_config.adc_config.raw_data[0],
             soundwave_config.adc_config.voltage[0]);

    adc_oneshot_read(soundwave_config.adc_config.handle,
                     soundwave_config.adc_config.channels[1],
                     &soundwave_config.adc_config.raw_data[1]);
    adc_cali_raw_to_voltage(soundwave_config.adc_config.cali_handles[1],
                            soundwave_config.adc_config.raw_data[1],
                            &soundwave_config.adc_config.voltage[1]);

    ESP_LOGV(TAG, "Channel 1: Raw: %d, Voltage: %d mV",
             soundwave_config.adc_config.raw_data[1],
             soundwave_config.adc_config.voltage[1]);

    vTaskDelay(1000 / portTICK_PERIOD_MS); // Delay for 1 second
  }
}
