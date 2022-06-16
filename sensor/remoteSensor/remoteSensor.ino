#include "MDW_sensorSensei_loraNetwork.hpp"
#include "DFRobot_SHT20.h"
#include <Adafruit_BMP280.h>
#include <Arduino.h>
#include <M5Stack.h>
#include <Wire.h>

#define BMP280_PRESSION_ADDR   0x76

LoraNetwork loraNetwork;
DFRobot_SHT20     sht20;
Adafruit_BMP280   bmp280;

float humd = 0;
float temp = 0;
float pres = 0;
float alti = 0;
uint8_t tbPollution[32]={0};
int16_t tbPm[16]={0};

void setup(void)
{
  uint8_t errorCode = 0;

  M5.begin();
  M5.Power.begin();
  Serial2.begin(9600, SERIAL_8N1, 16, 17);
  pinMode(13, OUTPUT);
  digitalWrite(13, 1);
  
  M5.Lcd.setTextSize(1);
  M5.Lcd.println("Init success");
  
  errorCode |= loraNetwork.initialize();
  bmp280.begin(BMP280_PRESSION_ADDR);
  sht20.initSHT20();

  delay(100);

  sht20.checkSHT20();
}

void loop(void) 
{
  loraNetwork.receivePacket();
  if (loraNetwork.receiveData == LORA_GET_SENSOR_DATA_CMD)
  {
    readValue();
    String message = "{\"humidity\": \"";
    message.concat(humd);
    message += "\", \"temperature\": \"";
    message.concat(temp);
    message += "\", \"pressure\": \"";
    message.concat(pres);
    message += "\", \"altitude\": \"";
    message.concat(alti);
    message += "\", \"P2\": \"";
    message.concat(tbPm[3]);
    message += "\", \"P1\": \"";
    message.concat(tbPm[4]);
    message += "\"}";
    
    loraNetwork.receiveData = "";
    loraNetwork.sendPacket(message);
  }
}

static void readValue(void)
{
  humd = sht20.readHumidity();
  temp = sht20.readTemperature();
  pres = bmp280.readPressure() / 100;
  alti = bmp280.readAltitude(1022.1);
  delay(500);
  readPm();
}

static void readPm(void)
{
  static uint8_t index = 0;
  
  while (index != 32)
  {
    if(Serial2.available())
    {
    tbPollution[index] = Serial2.read();
    delay(10);
    index++;
    }
    else
    {
      index = 0;
    }
  }
  index = 0;
  
  //delay(2000);
  
  for(uint8_t count = 0, index = 0; count < 32 ; count++)
  {
    if( (count % 2) == 0)
    {
      tbPm[index] = tbPollution[count];
      tbPm[index] = tbPm[index] << 8;
    }
    else
    {
      tbPm[index] |= tbPollution[count];
      index++;
    }
  }
}
