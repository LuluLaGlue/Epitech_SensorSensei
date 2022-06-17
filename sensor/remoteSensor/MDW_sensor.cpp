#include "MDW_sensor.hpp"
#include "configuration.h"

#include <Wire.h>

void RemoteSensor::initialize(void)
{
  Serial2.begin(9600, SERIAL_8N1, 16, 17);
  pinMode(13, OUTPUT);
  digitalWrite(13, 1);

  this->bmp280.begin(BMP280_PRESSION_ADDR);
  this->sht20.initSHT20();
  
  delay(100);

  this->sht20.checkSHT20();
}

String RemoteSensor::getSensorValue(void)
{
  readPmValue();
  String sensorValue = "{\"humidity\": \"";
  sensorValue.concat(this->sht20.readHumidity());
  sensorValue += "\", \"temperature\": \"";
  sensorValue.concat(this->sht20.readTemperature());
  sensorValue += "\", \"pressure\": \"";
  sensorValue.concat( (bmp280.readPressure() / 100) );
  sensorValue += "\", \"altitude\": \"";
  sensorValue.concat(bmp280.readAltitude(ALTITUDE_REF));
  sensorValue += "\", \"P2\": \"";
  sensorValue.concat(pmValue[1]);
  sensorValue += "\", \"P1\": \"";
  sensorValue.concat(pmValue[1]);
  sensorValue += "\"}";
  
  return sensorValue;
}

void RemoteSensor::readPmValue(void)
{
  uint8_t index = 0;
  uint8_t tbPmBrutValue[32]={0};
  int16_t tbPmValue[16]={0};

  while (index != 32)
  {
    if(Serial2.available())
    {
      tbPmBrutValue[index] = Serial2.read();
      delay(10);
      index++;
    }
    else
    {
      index = 0;
    }
  }
  index = 0;
    
  for(uint8_t count = 0, index = 0; count < 32 ; count++)
  {
    if( (count % 2) == 0)
    {
      tbPmValue[index] = tbPmBrutValue[count];
      tbPmValue[index] = tbPmValue[index] << 8;
    }
    else
    {
      tbPmValue[index] |= tbPmBrutValue[count];
      index++;
    }
  }
  this->pmValue[0] = tbPmValue[3];
  this->pmValue[1] = tbPmValue[4];
}
