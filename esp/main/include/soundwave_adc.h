#ifndef SOUNDWAVE_ADC_H
#define SOUNDWAVE_ADC_H

#include <esp_adc/adc_cali.h>
#include <esp_adc/adc_oneshot.h>

typedef struct
{
  adc_channel_t channels[2]; // ADC channels to read from
  adc_oneshot_unit_handle_t handle;
  int raw_data[2];                      // Raw data from ADC
  int voltage[2];                       // Converted voltage values
  adc_cali_handle_t cali_handles[2];    // Calibration handles
  adc_oneshot_unit_init_cfg_t unit_cfg; // ADC unit configuration
} soundwave_adc_config_t;

void soundwave_adc_init(soundwave_adc_config_t *adc_config);

#endif // SOUNDWAVE_ADC_H
