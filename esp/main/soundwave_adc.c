#include "soundwave_adc.h"

#include <esp_log.h>

const static char *TAG = "[SOUNDWAVE][ADC]";

static bool
adc_calibration_init(adc_unit_t unit, adc_channel_t channel, adc_atten_t atten, adc_cali_handle_t *out_handle)
{
  adc_cali_handle_t handle = NULL;
  esp_err_t ret = ESP_FAIL;
  bool calibrated = false;

#if ADC_CALI_SCHEME_CURVE_FITTING_SUPPORTED
  if (!calibrated)
  {
    ESP_LOGI(TAG, "Calibration scheme version is %s", "Curve Fitting");
    adc_cali_curve_fitting_config_t cali_config = {
      .unit_id = unit,
      .chan = channel,
      .atten = atten,
      .bitwidth = ADC_BITWIDTH_DEFAULT,
    };
    ret = adc_cali_create_scheme_curve_fitting(&cali_config, &handle);
    if (ret == ESP_OK)
    {
      calibrated = true;
    }
  }
#endif /* ADC_CALI_SCHEME_CURVE_FITTING_SUPPORTED */

#if ADC_CALI_SCHEME_LINE_FITTING_SUPPORTED
  if (!calibrated)
  {
    ESP_LOGI(TAG, "Calibration scheme version is %s", "Line Fitting");
    adc_cali_line_fitting_config_t cali_config = {
      .unit_id = unit,
      .atten = atten,
      .bitwidth = ADC_BITWIDTH_DEFAULT,
    };
    ret = adc_cali_create_scheme_line_fitting(&cali_config, &handle);
    if (ret == ESP_OK)
    {
      calibrated = true;
    }
  }
#endif /* ADC_CALI_SCHEME_LINE_FITTING_SUPPORTED */

  *out_handle = handle;
  if (ret == ESP_OK)
  {
    ESP_LOGI(TAG, "Calibration Success");
  }
  else if (ret == ESP_ERR_NOT_SUPPORTED || !calibrated)
  {
    ESP_LOGW(TAG, "eFuse not burnt, skip software calibration");
  }
  else
  {
    ESP_LOGE(TAG, "Invalid arg or no memory");
  }

  return calibrated;
}

void adc_init(soundwave_adc_config_t *adc_config)
{
  adc_config->unit_cfg = (adc_oneshot_unit_init_cfg_t) {
    .unit_id = ADC_UNIT_1,
  };
  ESP_ERROR_CHECK(adc_oneshot_new_unit(&adc_config->unit_cfg, &adc_config->handle));

  adc_oneshot_chan_cfg_t chan_cfg = {
    .atten = ADC_ATTEN_DB_12,
    .bitwidth = ADC_BITWIDTH_12,
  };

  adc_oneshot_config_channel(adc_config->handle, adc_config->channels[0], &chan_cfg);
  adc_oneshot_config_channel(adc_config->handle, adc_config->channels[1], &chan_cfg);
  adc_calibration_init(ADC_UNIT_1, adc_config->channels[0], ADC_ATTEN_DB_12, &adc_config->cali_handles[0]);
  adc_calibration_init(ADC_UNIT_1, adc_config->channels[1], ADC_ATTEN_DB_12, &adc_config->cali_handles[1]);
}
