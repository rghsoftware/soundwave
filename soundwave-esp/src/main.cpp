#include <Arduino.h>
#include <SPI.h>
#include <cmath>  // For std::fabs
#include <limits> // For std::numeric_limits

#include "moving_avg_filter.h"

// DEFINES
#define BUTTON_PIN_PLAY_PAUSE (35)
#define BUTTON_PIN_PREVIOUS   (32)
#define BUTTON_PIN_NEXT       (33)

#define ADC_PIN_VOLUME     (39)
#define ADC_PIN_BRIGHTNESS (36)

typedef struct {
  bool playPausePressed;
  bool previousPressed;
  bool nextPressed;
  uint8_t volume;
  uint8_t brightness;
} DeviceState;

// STATE DEFINITIONS
bool currButtonState[3] = {false, false, false};
int prevVolume = 0;
int currVolume = 0;
int prevBrightness = 0;
int currBrightness = 0;
bool stateChanged = false;
MovingAvgFilter volumeFilter;
MovingAvgFilter brightnessFilter;
SPIClass *pSpiBus;
DeviceState deviceState = {false, false, false, 0, 0};

// FUNCTION PROTOTYPES
int normalizedADCRead(int pin);
bool adcValueChanged(int prevValue, int currValue);
void sendSpiData();

void setup() {
  Serial.begin(115200);

  // GPIO pin setup
  pinMode(BUTTON_PIN_PLAY_PAUSE, INPUT_PULLDOWN);
  Serial.println("GPIO pin setup complete");

  // ADC pin setup
  // set ADC attenuation to 11dB for ~3.3V range
  analogSetAttenuation(ADC_11db);
  // Warm up inputs to avoid initial noise
  for (int i = 0; i < (MOVING_AVG_FILTER_SIZE * 2); i++) {
    digitalRead(BUTTON_PIN_PLAY_PAUSE);
    volumeFilter.addValue(normalizedADCRead(ADC_PIN_VOLUME));
    brightnessFilter.addValue(normalizedADCRead(ADC_PIN_BRIGHTNESS));
  }
  prevVolume = volumeFilter.getAverage();
  prevBrightness = brightnessFilter.getAverage();
  Serial.println("ADC pin setup complete");

  // SPI setup
  pSpiBus = new SPIClass(VSPI);
  pSpiBus->begin(); // Use default VSPI pins
  pinMode(pSpiBus->pinSS(), OUTPUT);
  Serial.println("SPI setup complete");
}

void loop() {
  // Check button states
  currButtonState[0] = digitalRead(BUTTON_PIN_PLAY_PAUSE) == HIGH;

  if (currButtonState[0] != deviceState.playPausePressed) {
    stateChanged = true; // Button state has changed
    deviceState.playPausePressed = !deviceState.playPausePressed;
  }

  // Check ADC values
  // Normalize ADC values to a range of 0-100 for volume and brightness
  volumeFilter.addValue(normalizedADCRead(ADC_PIN_VOLUME));
  currVolume = volumeFilter.getAverage();
  brightnessFilter.addValue(normalizedADCRead(ADC_PIN_BRIGHTNESS));
  currBrightness = brightnessFilter.getAverage();

  // Print changes
  if (adcValueChanged(prevVolume, currVolume)) {
    Serial.print("Volume: ");
    Serial.println(currVolume);
    stateChanged = true;
    deviceState.volume = currVolume;
  }
  if (adcValueChanged(prevBrightness, currBrightness)) {
    Serial.print("Brightness: ");
    Serial.println(currBrightness);
    stateChanged = true;
    deviceState.brightness = currBrightness;
  }

  if (stateChanged) {
    // Print the current state
    sendSpiData();
    Serial.println("State changed, sending data via SPI");

    stateChanged = false;                // Reset state change flag
    deviceState.previousPressed = false; // Reset previous button state
    deviceState.nextPressed = false;     // Reset next button state
  }

  delay(100); // delay to debounce the button press
}

// FUNCTION DEFINITIONS
int normalizedADCRead(int pin) {
  int rawValue = analogRead(pin);
  return map(rawValue, 0, 4095, 0, 100); // Normalize to a range of 0-100
}

bool adcValueChanged(int prevValue, int currValue) {
  return std::fabs(currValue - prevValue) > 1.0;
}

void sendSpiData() {
  pSpiBus->beginTransaction(SPISettings(1000000, MSBFIRST, SPI_MODE0));
  digitalWrite(pSpiBus->pinSS(), LOW); // Pull SS low to start communication
  pSpiBus->transfer((uint8_t *)&deviceState, sizeof(DeviceState));
  digitalWrite(pSpiBus->pinSS(), HIGH); // Pull SS high to end communication
  pSpiBus->endTransaction();
}