#include "MDW_sensorSensei_loraNetwork.hpp"
#include "configuration.h"

#include <M5LoRa.h>
#include <M5Stack.h>

uint8_t LoraNetwork::initialize(void)
{
	uint8_t returnCode = 1;
	
	LoRa.setPins();
	if ( LoRa.begin(LORA_FREQUENCY) == 1);
  {
    returnCode = 0;
  }
	this->deviceAddresse = LORA_DEVICE_ADDRESSE;
  this->destinationAddresse = LORA_DESTINATION_ADDRESSE;
  this->waitResponse = 0;  
  
	return returnCode;
}

void LoraNetwork::sendPacket(String payload)
{
	LoRa.beginPacket();
	LoRa.write(this->destinationAddresse);
  LoRa.write(this->deviceAddresse);
  LoRa.write(payload.length());
  LoRa.print(payload);
	LoRa.endPacket();

  this->lastCmd = payload;
  this->waitResponse = 1;
}

void LoraNetwork::receivePacket(void)
{
  uint8_t payloadLength = 0;
  uint8_t packetSize = LoRa.parsePacket();

  this->receiveData = "";
  if (packetSize != 0)
  {
    if ( (LoRa.read() == this->deviceAddresse) && (LoRa.read() == this->destinationAddresse) )
    {
      payloadLength = LoRa.read();
      while (LoRa.available())
      {
        this->receiveData += (char)LoRa.read();
      }
      waitResponse = 0;
    }
  }
}
