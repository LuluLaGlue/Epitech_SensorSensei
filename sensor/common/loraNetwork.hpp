#ifndef LORANETWORK_HPP
#define LORANETWORK_HPP

#include <stdint.h>
#include <Arduino.h>

#define LORA_INIT_CMD               "0x01"
#define LORA_GET_SENSOR_DATA_CMD    "0x02"

class LoraNetwork
{
public:
  uint8_t waitResponse;
  String receiveData;

  void LoraNetwork(void);
  void sendPacket(String payload);
  void receivePacket(void);
  void clearReceiveData(void);
  
private:
  String lastCmd;
  uint8_t deviceAddresse;
  uint8_t destinationAddresse;
};

#endif // LORANETWORK_HPP
