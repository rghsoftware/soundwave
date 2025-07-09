#ifndef MOVING_AVG_FILTER_H
#define MOVING_AVG_FILTER_H

#define MOVING_AVG_FILTER_SIZE (20)

class MovingAvgFilter {
public:
  MovingAvgFilter(int size = MOVING_AVG_FILTER_SIZE);
  ~MovingAvgFilter();
  float addValue(float value);
  float getAverage() const;

private:
  float *buffer;
  int buffer_size;
  int index;
  float sum;
};

#endif // MOVING_AVG_FILTER_H