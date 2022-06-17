#include "common/loraNetwork.hpp"
#include "MDW_sensor.hpp"

#include <Arduino.h>
#include <M5Stack.h>

LoraNetwork loraNetwork;
RemoteSensor remoteSensor;

void setup(void)
{
  M5.begin();
  M5.Power.begin();
  loraNetwork();
  remoteSensor();
}

void loop(void)
{
  loraNetwork.receivePacket();
  if (loraNetwork.receiveData == LORA_GET_SENSOR_DATA_CMD)
  {
    loraNetwork.clearReceiveData();
    loraNetwork.sendPacket(remoteSensor.getSensorValue());
  }
}
