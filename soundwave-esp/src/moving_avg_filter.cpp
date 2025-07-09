#include "moving_avg_filter.h"

float MovingAvgFilter::getAverage() const { return sum / buffer_size; }

MovingAvgFilter::MovingAvgFilter(int size)
    : index(0), sum(0), buffer_size(size) {
  buffer = new float[buffer_size];
  for (int i = 0; i < buffer_size; i++) {
    buffer[i] = 0;
  }
}

MovingAvgFilter::~MovingAvgFilter() { delete[] buffer; }

float MovingAvgFilter::addValue(float value) {
  // Remove the oldest value from the sum
  sum -= buffer[index];

  // Add the new value to the buffer and the sum
  buffer[index] = value;
  sum += value;

  // Move to the next index
  index = (index + 1) % buffer_size;

  return getAverage();
}