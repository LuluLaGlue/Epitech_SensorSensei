#ifndef MDW_SENSOR_HPP
#define MDW_SENSOR_HPP

#include <Arduino.h>
#include <Adafruit_BMP280.h>
#include "DFRobot_SHT20.h"

#define BMP280_PRESSION_ADDR   0x76

class MDWSensor
{
public:
  void MDWSensor(void);
  String  getSensorValue(void);
  
private:
  DFRobot_SHT20     sht20;
  Adafruit_BMP280   bmp280;
  uint8_t           pmValue[2];

  void readPmValue(void);
};

#endif // MDW_SENSOR_HPP  
