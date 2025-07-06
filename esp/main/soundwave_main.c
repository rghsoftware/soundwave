#include "soundwave_adc.h"

#include <freertos/FreeRTOS.h>

#include <esp_adc/adc_cali.h>
#include <esp_adc/adc_oneshot.h>
#include <esp_log.h>
#include <hal/adc_types.h>

const static char *TAG = "[SOUNDWAVE][MAIN]";

typedef struct
{
  soundwave_adc_config_t adc_config; // ADC configuration
} soundwave_config_t;

void app_main(void)
{
  ESP_LOGI(TAG, "Starting Soundwave application...");
  soundwave_config_t soundwave_config = { .adc_config = {
                                              .channels = { ADC_CHANNEL_0, ADC_CHANNEL_3 },
                                          } };
  adc_init(&soundwave_config.adc_config);

  while (1)
  {
    adc_oneshot_read(soundwave_config.adc_config.handle,
        soundwave_config.adc_config.channels[0],
        &soundwave_config.adc_config.raw_data[0]);
    adc_cali_raw_to_voltage(soundwave_config.adc_config.cali_handles[0],
        soundwave_config.adc_config.raw_data[0],
        &soundwave_config.adc_config.voltage[0]);

    adc_oneshot_read(soundwave_config.adc_config.handle,
        soundwave_config.adc_config.channels[1],
        &soundwave_config.adc_config.raw_data[1]);
    adc_cali_raw_to_voltage(soundwave_config.adc_config.cali_handles[1],
        soundwave_config.adc_config.raw_data[1],
        &soundwave_config.adc_config.voltage[1]);

    ESP_LOGI(TAG,
        "Channel 0: Raw: %d, Voltage: %d mV",
        soundwave_config.adc_config.raw_data[0],
        soundwave_config.adc_config.voltage[0]);
    ESP_LOGI(TAG,
        "Channel 1: Raw: %d, Voltage: %d mV",
        soundwave_config.adc_config.raw_data[1],
        soundwave_config.adc_config.voltage[1]);

    vTaskDelay(1000 / portTICK_PERIOD_MS); // Delay for 1 second
  }
}
