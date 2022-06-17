#include "MDW_sensorSensei_loraNetwork.hpp"
#include "MDW_sensor.hpp"

#include <Arduino.h>
#include <M5Stack.h>

LoraNetwork loraNetwork;
RemoteSensor remoteSensor;

void setup(void)
{
  uint8_t errorCode = 0; 
  
  M5.begin();
  M5.Power.begin();
  errorCode |= loraNetwork.initialize();
  remoteSensor.initialize();
  if (errorCode == 0)
  {
    M5.Lcd.println("Init success");
  }
}

void loop(void)
{
  loraNetwork.receivePacket();
  if (loraNetwork.receiveData == LORA_GET_SENSOR_DATA_CMD)
  {
    loraNetwork.receiveData = "";
    loraNetwork.sendPacket(remoteSensor.getSensorValue());
  }
}
