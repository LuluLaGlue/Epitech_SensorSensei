#ifndef MDW_SENSORSENSEI_LORANETWORK_HPP
#define MDW_SENSORSENSEI_LORANETWORK_HPP

#include <stdint.h>
#include <Arduino.h>

#define LORA_INIT_CMD               "0x01"
#define LORA_GET_SENSOR_DATA_CMD    "0x02"

class LoraNetwork
{
public:
  uint8_t waitResponse;
  String receiveData;
  uint8_t initialize(void);
  void sendPacket(String payload);
  void receivePacket(void);
  
private:

  String lastCmd;
  uint8_t deviceAddresse;
  uint8_t destinationAddresse;  
};

#endif // MDW_SENSORSENSEI_LORANETWORK_HPP 
