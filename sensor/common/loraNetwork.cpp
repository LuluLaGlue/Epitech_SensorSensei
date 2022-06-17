#include "loraNetwork.hpp"
#include "configuration.h"

#include <M5LoRa.h>
#include <M5Stack.h>

void LoraNetwork::LoraNetwork(void)
{
	LoRa.setPins();
	LoRa.begin(LORA_FREQUENCY);
	this->deviceAddresse = LORA_DEVICE_ADDRESSE;
    this->destinationAddresse = LORA_DESTINATION_ADDRESSE;
    this->waitResponse = 0;
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

  clearReceiveData();
  if (packetSize != 0)
  {
    if ( (LoRa.read() == this->deviceAddresse) && (LoRa.read() == this->destinationAddresse) )
    {
      payloadLength = LoRa.read();
      while (LoRa.available())
      {
        this->receiveData += (char)LoRa.read();
      }
      M5.Lcd.println(this->receiveData);
      waitResponse = 0;
    }
  }
}

void LoraNetwork::clearReceiveData(void)
{
    this->receiveData = "";
}
