#include "configuration.h"
#include "wifiNetwork.hpp"
#include "/common/loraNetwork.hpp"

#include <Arduino.h>
#include <M5Stack.h>
#include <HTTPClient.h>

WifiNetwork wifiNetwork;
LoraNetwork loraNetwork;
HTTPClient  api;

void setup(void)
{
  
  M5.begin();
  M5.Power.begin();
  
  wifiNetwork();
  loraNetwork();
  M5.Lcd.printf("Init success\r\nNode ID =");
  M5.Lcd.println(X_SENSOR);
}

void loop(void)
{
  static uint8_t errorCode = 0;
  
  errorCode = wifiNetwork.getTime();
  if ( (errorCode == 0) && ( (wifiNetwork.timeInfo.tm_sec % LORA_SEND_DATA_DELAY_MINUTES) == 0) )
  {
    M5.Lcd.print(&wifiNetwork.timeInfo, "\n%A, %B %d \n%Y %H:%M:%S");
    loraNetwork.sendPacket(LORA_GET_SENSOR_DATA_CMD);
    while(loraNetwork.waitResponse == 1)
    {
        loraNetwork.receivePacket();
    }
    api.begin(API_ADDRESSE);
    api.addHeader("X-Sensor", X_SENSOR);
    api.addHeader("X-Pin", "3");
    api.addHeader("Content-Type", "Application/JSON");                    
    errorCode = api.sendRequest("POST", loraNetwork.receiveData);
    api.end();
  }
  delay(1000);
}
